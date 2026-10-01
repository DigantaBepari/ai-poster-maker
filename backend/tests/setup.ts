import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
export async function setupTestApp() {
  const mongo = await MongoMemoryServer.create();
  Object.assign(process.env, {
    NODE_ENV: "test",
    MONGODB_URI: mongo.getUri(),
    JWT_SECRET: "test-only-jwt-secret-at-least-32-characters",
    CLIENT_URL: "http://localhost:3000",
  });
  const { app } = await import("../src/app.js");
  await mongoose.connect(mongo.getUri());
  const { User } = await import("../src/models/User.js");
  await User.init();
  const { seedTemplateRecords, seedTemplates } =
    await import("../src/seed/templates.seed.js");
  await seedTemplateRecords();
  const owner = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Owner",
      email: "owner@example.com",
      password: "password123",
    });
  const other = await request(app)
    .post("/api/auth/register")
    .send({ name: "Other", phone: "+8801700000000", password: "password123" });
  const admin = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Admin",
      email: "admin@example.com",
      password: "password123",
    });
  await User.findByIdAndUpdate(admin.body.user.id, { role: "admin" });
  const templates = await request(app).get(
    "/api/templates?occasionType=victory-day",
  );
  return {
    app,
    mongo,
    seedTemplates,
    token: owner.body.token as string,
    otherToken: other.body.token as string,
    adminToken: admin.body.token as string,
    userId: owner.body.user.id as string,
    adminId: admin.body.user.id as string,
    templateId: templates.body[0]._id as string,
  };
}
export async function teardownTestApp(mongo?: MongoMemoryServer) {
  await mongoose.disconnect();
  await mongo?.stop();
}
export const formData = {
  name: "Name",
  designation: "Worker",
  party: "Org",
  union: "Union",
  thana: "Thana",
  district: "District",
  occasionType: "victory-day",
  headline: "Headline",
};
