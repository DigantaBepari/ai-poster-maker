import { beforeAll, afterAll, it, expect } from "vitest";
import request from "supertest";
import { setupTestApp, teardownTestApp } from "./setup.js";
let ctx: Awaited<ReturnType<typeof setupTestApp>>;
beforeAll(async () => {
  ctx = await setupTestApp();
}, 120000);
afterAll(() => teardownTestApp(ctx?.mongo));
it("requires authentication, a photo and supported image contents", async () => {
  expect((await request(ctx.app).post("/api/upload")).status).toBe(401);
  expect(
    (
      await request(ctx.app)
        .post("/api/upload")
        .field("photoConsent", "true")
        .auth(ctx.token, { type: "bearer" })
    ).status,
  ).toBe(400);
  expect(
    (
      await request(ctx.app)
        .post("/api/upload")
        .field("photoConsent", "true")
        .auth(ctx.token, { type: "bearer" })
        .attach("photo", Buffer.from("fake"), {
          filename: "fake.png",
          contentType: "image/png",
        })
    ).body.error.code,
  ).toBe("INVALID_IMAGE");
  expect(
    (
      await request(ctx.app)
        .post("/api/upload")
        .field("photoConsent", "true")
        .auth(ctx.token, { type: "bearer" })
        .attach("photo", Buffer.from("svg"), {
          filename: "test.svg",
          contentType: "image/svg+xml",
        })
    ).status,
  ).toBe(400);
});
it("rejects uploads over 5 MB and multiple photos", async () => {
  const r = await request(ctx.app)
    .post("/api/upload")
    .auth(ctx.token, { type: "bearer" })
    .attach("photo", Buffer.alloc(5 * 1024 * 1024 + 1), {
      filename: "large.png",
      contentType: "image/png",
    });
  expect(r.status).toBe(400);
  expect(r.body.error.code).toBe("UPLOAD_ERROR");
  expect(
    (
      await request(ctx.app)
        .post("/api/upload")
        .field("photoConsent", "true")
        .auth(ctx.token, { type: "bearer" })
        .attach("photo", Buffer.from("x"), {
          filename: "one.png",
          contentType: "image/png",
        })
        .attach("photo", Buffer.from("y"), {
          filename: "two.png",
          contentType: "image/png",
        })
    ).status,
  ).toBe(400);
});
it("returns structured route, filter and malformed ID errors", async () => {
  const r = await request(ctx.app).get("/api/missing");
  expect(r.status).toBe(404);
  expect(r.body.error.code).toBe("NOT_FOUND");
  expect(
    (await request(ctx.app).get("/api/templates?occasionType=invalid")).status,
  ).toBe(400);
  expect(
    (await request(ctx.app).get("/api/templates/bad-id")).body.error.code,
  ).toBe("INVALID_ID");
});
