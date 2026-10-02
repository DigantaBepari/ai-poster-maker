import { vi } from "vitest";
vi.mock("../src/services/poster/posterQueue.js", () => ({
  posterQueue: { assertAvailable: vi.fn(), enqueue: vi.fn() },
}));
import { beforeAll, afterAll, it, expect } from "vitest";
import request from "supertest";
import { setupTestApp, teardownTestApp, formData } from "./setup.js";
let ctx: Awaited<ReturnType<typeof setupTestApp>>;
beforeAll(async () => {
  ctx = await setupTestApp();
}, 120000);
afterAll(() => teardownTestApp(ctx?.mongo));
const draft = () =>
  request(ctx.app)
    .post("/api/posters")
    .auth(ctx.token, { type: "bearer" })
    .send({ templateId: ctx.templateId, formData, uploadedPhotoUrls: [] });
it("creates, gets, lists, and deletes an owned draft", async () => {
  const r = await draft();
  expect(r.status).toBe(202);
  expect(r.body.status).toBe("generating");
  expect(r.body.retryCount).toBe(0);
  const id = r.body._id;
  const { Poster } = await import("../src/models/Poster.js");
  await Poster.findByIdAndUpdate(id, { status: "completed" });
  expect(
    (
      await request(ctx.app)
        .get("/api/posters/" + id)
        .auth(ctx.token, { type: "bearer" })
    ).body._id,
  ).toBe(id);
  expect(
    (
      await request(ctx.app)
        .get("/api/posters/user/" + ctx.userId)
        .auth(ctx.token, { type: "bearer" })
    ).body,
  ).toHaveLength(1);
  expect(
    (
      await request(ctx.app)
        .delete("/api/posters/" + id)
        .auth(ctx.token, { type: "bearer" })
    ).status,
  ).toBe(204);
  expect(
    (
      await request(ctx.app)
        .get("/api/posters/" + id)
        .auth(ctx.token, { type: "bearer" })
    ).status,
  ).toBe(404);
});
it("denies foreign users every poster action and allows admin access", async () => {
  const r = await draft();
  const id = r.body._id;
  const { Poster } = await import("../src/models/Poster.js");
  await Poster.findByIdAndUpdate(id, { status: "completed" });
  for (const method of ["get", "delete"] as const)
    expect(
      (
        await request(ctx.app)
          [method]("/api/posters/" + id)
          .auth(ctx.otherToken, { type: "bearer" })
      ).status,
    ).toBe(403);
  expect(
    (
      await request(ctx.app)
        .get("/api/posters/user/" + ctx.userId)
        .auth(ctx.otherToken, { type: "bearer" })
    ).status,
  ).toBe(403);
  expect(
    (
      await request(ctx.app)
        .post("/api/posters/" + id + "/regenerate")
        .auth(ctx.otherToken, { type: "bearer" })
    ).status,
  ).toBe(403);
  expect(
    (
      await request(ctx.app)
        .get("/api/posters/" + id)
        .auth(ctx.adminToken, { type: "bearer" })
    ).status,
  ).toBe(200);
  expect(
    (
      await request(ctx.app)
        .post("/api/posters/" + id + "/regenerate")
        .auth(ctx.token, { type: "bearer" })
    ).status,
  ).toBe(202);
  await request(ctx.app)
    .delete("/api/posters/" + id)
    .auth(ctx.adminToken, { type: "bearer" });
});
it("rejects mismatched occasions, injected owner/status, and excessive photos", async () => {
  const url = "https://res.cloudinary.com/demo/image/upload/photo.png";
  const body = { templateId: ctx.templateId, formData, uploadedPhotoUrls: [] };
  for (const invalid of [
    { ...body, formData: { ...formData, occasionType: "condolence" } },
    { ...body, userId: ctx.userId },
    { ...body, status: "completed" },
    { ...body, uploadedPhotoUrls: [url, url, url, url] },
  ])
    expect(
      (
        await request(ctx.app)
          .post("/api/posters")
          .auth(ctx.token, { type: "bearer" })
          .send(invalid)
      ).status,
    ).toBe(400);
  const templates = await request(ctx.app).get(
    "/api/templates?occasionType=condolence",
  );
  expect(
    (
      await request(ctx.app)
        .post("/api/posters")
        .auth(ctx.token, { type: "bearer" })
        .send({
          templateId: templates.body[0]._id,
          formData: { ...formData, occasionType: "condolence" },
          uploadedPhotoUrls: [url, url],
        })
    ).status,
  ).toBe(400);
});
