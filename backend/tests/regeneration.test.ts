import { beforeAll, afterAll, it, expect, vi } from "vitest";
import request from "supertest";
vi.mock("../src/services/poster/posterQueue.js", () => ({
  posterQueue: { assertAvailable: vi.fn(), enqueue: vi.fn() },
}));
import { setupTestApp, teardownTestApp, formData } from "./setup.js";
let ctx: Awaited<ReturnType<typeof setupTestApp>>;
beforeAll(async () => {
  ctx = await setupTestApp();
}, 120000);
afterAll(() => teardownTestApp(ctx?.mongo));
async function poster() {
  const { Poster } = await import("../src/models/Poster.js");
  return Poster.create({
    userId: ctx.userId,
    templateId: ctx.templateId,
    formData,
    status: "completed",
    uploadedPhotoUrls: [],
  });
}
it("increments retries, persists edits, and refuses a fourth regeneration", async () => {
  const { Poster } = await import("../src/models/Poster.js");
  const p = await poster();
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await request(ctx.app)
      .post("/api/posters/" + p.id + "/regenerate")
      .auth(ctx.token, { type: "bearer" })
      .send({ formData: { headline: "সম্পাদিত বাংলা শিরোনাম" } });
    expect(r.status).toBe(202);
    expect(r.body.retryCount).toBe(attempt);
    expect(r.body.remainingRegenerations).toBe(3 - attempt);
    expect(r.body.formData.headline).toBe("সম্পাদিত বাংলা শিরোনাম");
    await Poster.findByIdAndUpdate(p.id, { status: "completed" });
  }
  const rejected = await request(ctx.app)
    .post("/api/posters/" + p.id + "/regenerate")
    .auth(ctx.token, { type: "bearer" })
    .send({});
  expect(rejected.status).toBe(429);
  expect(rejected.body.error.code).toBe("RETRY_LIMIT");
});
it("atomically permits only one concurrent regeneration", async () => {
  const p = await poster();
  const responses = await Promise.all(
    [1, 2].map(() =>
      request(ctx.app)
        .post("/api/posters/" + p.id + "/regenerate")
        .auth(ctx.token, { type: "bearer" })
        .send({}),
    ),
  );
  expect(responses.filter((r) => r.status === 202)).toHaveLength(1);
  expect(responses.filter((r) => r.status === 409)).toHaveLength(1);
});
it("rejects prohibited text and missing consent before queueing", async () => {
  const body = {
    templateId: ctx.templateId,
    formData: { ...formData, headline: "kill all" },
  };
  expect(
    (
      await request(ctx.app)
        .post("/api/posters")
        .auth(ctx.token, { type: "bearer" })
        .send(body)
    ).status,
  ).toBe(422);
  expect(
    (
      await request(ctx.app)
        .post("/api/posters")
        .auth(ctx.token, { type: "bearer" })
        .send({ ...body, formData: { ...formData, photoConsent: false } })
    ).status,
  ).toBe(400);
});
it("denies flagged owner downloads and hides generated URLs", async () => {
  const { Poster } = await import("../src/models/Poster.js");
  const p = await poster();
  await Poster.findByIdAndUpdate(p.id, {
    flagged: true,
    generatedImageUrl: "https://res.cloudinary.com/demo/image.png",
  });
  expect(
    (
      await request(ctx.app)
        .get("/api/posters/" + p.id + "/download?format=png")
        .auth(ctx.token, { type: "bearer" })
    ).status,
  ).toBe(403);
  expect(
    (
      await request(ctx.app)
        .get("/api/posters/" + p.id)
        .auth(ctx.token, { type: "bearer" })
    ).body.generatedImageUrl,
  ).toBeUndefined();
});
