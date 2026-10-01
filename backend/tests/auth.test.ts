import { beforeAll, afterAll, it, expect } from "vitest";
import request from "supertest";
import { setupTestApp, teardownTestApp } from "./setup.js";
let ctx: Awaited<ReturnType<typeof setupTestApp>>;
beforeAll(async () => {
  ctx = await setupTestApp();
}, 120000);
afterAll(() => teardownTestApp(ctx?.mongo));
it("requires identity, rejects role injection and protects me", async () => {
  expect(
    (
      await request(ctx.app)
        .post("/api/auth/register")
        .send({ name: "Test", password: "password123" })
    ).status,
  ).toBe(400);
  expect(
    (
      await request(ctx.app)
        .post("/api/auth/register")
        .send({
          name: "Test",
          email: "injected@example.com",
          password: "password123",
          role: "admin",
        })
    ).status,
  ).toBe(400);
  expect((await request(ctx.app).get("/api/auth/me")).status).toBe(401);
});
it("normalizes email, hashes passwords, and rejects duplicates", async () => {
  const body = {
    name: "New User",
    email: "New@Example.com",
    password: "password123",
  };
  const r = await request(ctx.app).post("/api/auth/register").send(body);
  expect(r.status).toBe(201);
  expect(r.body.user.email).toBe("new@example.com");
  expect(r.body.user.passwordHash).toBeUndefined();
  const { User } = await import("../src/models/User.js");
  const u = await User.findById(r.body.user.id).select("+passwordHash");
  expect(u?.passwordHash).not.toBe(body.password);
  expect(
    (await request(ctx.app).post("/api/auth/register").send(body)).status,
  ).toBe(409);
});
it("supports email and phone login while rejecting wrong passwords", async () => {
  expect(
    (
      await request(ctx.app)
        .post("/api/auth/login")
        .send({ email: "owner@example.com", password: "password123" })
    ).status,
  ).toBe(200);
  expect(
    (
      await request(ctx.app)
        .post("/api/auth/login")
        .send({ phone: "+8801700000000", password: "password123" })
    ).status,
  ).toBe(200);
  expect(
    (
      await request(ctx.app)
        .post("/api/auth/login")
        .send({ email: "owner@example.com", password: "wrong" })
    ).status,
  ).toBe(401);
  expect(
    (
      await request(ctx.app)
        .post("/api/auth/login")
        .send({
          email: "owner@example.com",
          phone: "+8801700000000",
          password: "password123",
        })
    ).status,
  ).toBe(400);
});
it("validates tokens and returns only the public profile", async () => {
  const r = await request(ctx.app)
    .get("/api/auth/me")
    .auth(ctx.token, { type: "bearer" });
  expect(r.body.id).toBe(ctx.userId);
  expect(r.body.passwordHash).toBeUndefined();
  expect(
    (
      await request(ctx.app)
        .get("/api/auth/me")
        .auth("invalid", { type: "bearer" })
    ).status,
  ).toBe(401);
  const jwt = await import("jsonwebtoken");
  const expired = jwt.default.sign({}, process.env.JWT_SECRET!, {
    subject: ctx.userId,
    expiresIn: -1,
  });
  expect(
    (
      await request(ctx.app)
        .get("/api/auth/me")
        .auth(expired, { type: "bearer" })
    ).status,
  ).toBe(401);
});
it("limits authentication attempts with consistent JSON errors", async () => {
  let response;
  for (let i = 0; i < 21; i++)
    response = await request(ctx.app).post("/api/auth/login").send({});
  expect(response?.status).toBe(429);
  expect(response?.body.error.code).toBe("RATE_LIMITED");
});
