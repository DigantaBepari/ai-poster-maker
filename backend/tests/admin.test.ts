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
it("protects admin routes", async () => {
  expect((await request(ctx.app).get("/api/admin/posters")).status).toBe(401);
  expect(
    (
      await request(ctx.app)
        .get("/api/admin/posters")
        .auth(ctx.token, { type: "bearer" })
    ).status,
  ).toBe(403);
  expect(
    (
      await request(ctx.app)
        .post("/api/admin/templates")
        .auth(ctx.token, { type: "bearer" })
        .send(ctx.seedTemplates[0])
    ).status,
  ).toBe(403);
});
it("creates, validates, updates, and deactivates templates", async () => {
  const r = await request(ctx.app)
    .post("/api/admin/templates")
    .auth(ctx.adminToken, { type: "bearer" })
    .send({ ...ctx.seedTemplates[0], title: "Custom template" });
  expect(r.status).toBe(201);
  const id = r.body._id;
  expect(
    (
      await request(ctx.app)
        .patch("/api/admin/templates/" + id)
        .auth(ctx.adminToken, { type: "bearer" })
        .send({ layoutConfig: { canvas: { width: 0, height: 1000 } } })
    ).status,
  ).toBe(400);
  expect(
    (
      await request(ctx.app)
        .patch("/api/admin/templates/" + id)
        .auth(ctx.adminToken, { type: "bearer" })
        .send({ title: "Updated" })
    ).body.title,
  ).toBe("Updated");
  expect((await request(ctx.app).get("/api/templates/" + id)).status).toBe(200);
  expect(
    (
      await request(ctx.app)
        .delete("/api/admin/templates/" + id)
        .auth(ctx.adminToken, { type: "bearer" })
    ).body.isActive,
  ).toBe(false);
  expect((await request(ctx.app).get("/api/templates/" + id)).status).toBe(404);
});
it("flags posters and filters admin listings", async () => {
  const r = await request(ctx.app)
    .post("/api/posters")
    .auth(ctx.token, { type: "bearer" })
    .send({ templateId: ctx.templateId, formData });
  const id = r.body._id;
  expect(
    (
      await request(ctx.app)
        .patch("/api/admin/posters/" + id + "/flag")
        .auth(ctx.adminToken, { type: "bearer" })
        .send({ flagged: true })
    ).body.flagged,
  ).toBe(true);
  expect(
    (
      await request(ctx.app)
        .get("/api/admin/posters?flagged=true")
        .auth(ctx.adminToken, { type: "bearer" })
    ).body,
  ).toHaveLength(1);
  expect(
    (
      await request(ctx.app)
        .get("/api/admin/posters?flagged=false")
        .auth(ctx.adminToken, { type: "bearer" })
    ).body,
  ).toHaveLength(0);
  expect(
    (
      await request(ctx.app)
        .patch("/api/admin/posters/" + id + "/flag")
        .auth(ctx.adminToken, { type: "bearer" })
        .send({ flagged: "yes" })
    ).status,
  ).toBe(400);
});
it("uses persisted roles, so a demoted admin loses access immediately", async () => {
  const { User } = await import("../src/models/User.js");
  await User.findByIdAndUpdate(ctx.adminId, { role: "user" });
  expect(
    (
      await request(ctx.app)
        .get("/api/admin/posters")
        .auth(ctx.adminToken, { type: "bearer" })
    ).status,
  ).toBe(403);
});
