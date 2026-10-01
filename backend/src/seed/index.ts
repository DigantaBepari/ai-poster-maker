import mongoose from "mongoose";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { hashPassword } from "../utils/password.js";
import { seedTemplateRecords, seedTemplates } from "./templates.seed.js";
import { templateThumbnail } from "./thumbnail.js";
import { logger } from "../utils/logger.js";
try {
  const folder = fileURLToPath(
    new URL("../../../frontend/public/templates/", import.meta.url),
  );
  await mkdir(folder, { recursive: true });
  for (const t of seedTemplates)
    await writeFile(folder + t.occasionType + ".svg", templateThumbnail(t));
  await connectDb();
  await User.init();
  await seedTemplateRecords();
  if (env.SEED_ADMIN_EMAIL && env.SEED_ADMIN_PASSWORD) {
    const existing = await User.findOne({ email: env.SEED_ADMIN_EMAIL });
    if (!existing)
      await User.create({
        name: "Administrator",
        email: env.SEED_ADMIN_EMAIL,
        passwordHash: await hashPassword(env.SEED_ADMIN_PASSWORD),
        role: "admin",
      });
    else
      logger.info("Admin email already exists; existing account was preserved");
  } else logger.info("Admin seed skipped: credentials are not configured");
  logger.info("Templates seeded successfully");
} catch {
  logger.error("Seed failed; check configuration and database access");
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
