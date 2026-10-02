import { beforeAll, afterAll, it, expect, vi } from "vitest";
import request from "supertest";
import sharp from "sharp";
import { fakeAssets } from "./fakeCloud.js";
import { setupTestApp, teardownTestApp, formData } from "./setup.js";
vi.mock("../src/config/cloudinary.js", async () => {
  const { fakeCloudinary } = await import("./fakeCloud.js");
  return { cloudinary: fakeCloudinary };
});
let ctx: Awaited<ReturnType<typeof setupTestApp>>;
beforeAll(async () => {
  Object.assign(process.env, {
    CLOUDINARY_CLOUD_NAME: "demo",
    CLOUDINARY_API_KEY: "test-only",
    CLOUDINARY_API_SECRET: "test-only",
    GEMINI_API_KEY: "",
    GEMINI_MODEL: "",
  });
  const original = globalThis.fetch;
  vi.stubGlobal("fetch", ((
    input: Parameters<typeof fetch>[0],
    init?: RequestInit,
  ) => {
    const data = fakeAssets.get(String(input));
    return data
      ? Promise.resolve(new Response(new Uint8Array(data)))
      : original(input, init);
  }) as typeof fetch);
  ctx = await setupTestApp();
}, 120000);
afterAll(async () => {
  const { closeRenderer } =
    await import("../src/services/render/renderer.service.js");
  const { posterQueue } = await import("../src/services/poster/posterQueue.js");
  await posterQueue.drain();
  await closeRenderer();
  await teardownTestApp(ctx?.mongo);
  vi.unstubAllGlobals();
});
async function completed(id: string) {
  for (let i = 0; i < 100; i++) {
    const response = await request(ctx.app)
      .get("/api/posters/" + id)
      .auth(ctx.token, { type: "bearer" });
    if (response.body.status === "failed")
      throw new Error(response.body.errorMessage);
    if (response.body.status === "completed") return response.body;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Timed out waiting for render");
}
it("uploads a consented photo, renders without Gemini, regenerates, downloads PNG/PDF, and lists history", async () => {
  const photo = await sharp({
    create: { width: 240, height: 300, channels: 3, background: "#bda784" },
  })
    .png()
    .toBuffer();
  expect(
    (
      await request(ctx.app)
        .post("/api/upload")
        .auth(ctx.token, { type: "bearer" })
        .attach("photo", photo, {
          filename: "portrait.png",
          contentType: "image/png",
        })
    ).status,
  ).toBe(422);
  const upload = await request(ctx.app)
    .post("/api/upload")
    .auth(ctx.token, { type: "bearer" })
    .field("photoConsent", "true")
    .attach("photo", photo, {
      filename: "portrait.png",
      contentType: "image/png",
    });
  expect(upload.status).toBe(201);
  const created = await request(ctx.app)
    .post("/api/posters")
    .auth(ctx.token, { type: "bearer" })
    .send({
      templateId: ctx.templateId,
      formData: {
        ...formData,
        headline: "মহান বিজয় দিবস",
        name: "মোহাম্মদ আব্দুল করিম চৌধুরী",
      },
      uploadedPhotoUrls: [upload.body.url],
    });
  expect(created.status).toBe(202);
  expect(created.body.status).toBe("generating");
  const id = created.body._id;
  const first = await completed(id);
  expect(first.generatedImageUrl).toBeTruthy();
  const image = await request(ctx.app)
    .get("/api/posters/" + id + "/download?format=png")
    .auth(ctx.token, { type: "bearer" });
  expect(image.status).toBe(200);
  const metadata = await sharp(image.body as Buffer).metadata();
  expect(metadata.width).toBe(2400);
  expect(metadata.height).toBe(3200);
  expect(image.headers["content-disposition"]).toContain(
    "poster-" + id + ".png",
  );
  const pdf = await request(ctx.app)
    .get("/api/posters/" + id + "/download?format=pdf")
    .auth(ctx.token, { type: "bearer" });
  expect(pdf.status).toBe(200);
  expect(pdf.headers["content-type"]).toContain("application/pdf");
  expect(
    (
      await request(ctx.app)
        .post("/api/posters/" + id + "/regenerate")
        .auth(ctx.token, { type: "bearer" })
        .send({ formData: { headline: "বিজয়ের শুভেচ্ছা ও অভিনন্দন" } })
    ).status,
  ).toBe(202);
  const regenerated = await completed(id);
  expect(regenerated.retryCount).toBe(1);
  expect(regenerated.formData.headline).toBe("বিজয়ের শুভেচ্ছা ও অভিনন্দন");
  expect(regenerated.generatedImageUrl).not.toBe(first.generatedImageUrl);
  const history = await request(ctx.app)
    .get("/api/posters/user/" + ctx.userId)
    .auth(ctx.token, { type: "bearer" });
  expect(history.body).toHaveLength(1);
  expect(history.body[0].status).toBe("completed");
}, 60000);
