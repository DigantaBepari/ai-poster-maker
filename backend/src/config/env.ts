import { z } from "zod";
const optional = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().optional(),
);
const defaults = (v: unknown) => (v === "" ? undefined : v);
export const env = z
  .object({
    NODE_ENV: z.preprocess(
      defaults,
      z.enum(["development", "test", "production"]).default("development"),
    ),
    PORT: z.preprocess(
      defaults,
      z.coerce.number().int().min(1).max(65535).default(4000),
    ),
    MONGODB_URI: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.preprocess(
      defaults,
      z
        .string()
        .regex(/^[1-9]\d*[smhd]$/)
        .default("7d"),
    ),
    CLIENT_URL: z.url(),
    CLOUDINARY_CLOUD_NAME: optional,
    CLOUDINARY_API_KEY: optional,
    CLOUDINARY_API_SECRET: optional,
    GEMINI_API_KEY: optional,
    GEMINI_MODEL: optional,
    SEED_ADMIN_EMAIL: z.preprocess(defaults, z.email().optional()),
    SEED_ADMIN_PASSWORD: z.preprocess(
      defaults,
      z.string().min(8).max(72).optional(),
    ),
    MAX_REGENERATIONS: z.preprocess(
      defaults,
      z.coerce.number().int().min(0).default(3),
    ),
  })
  .parse(process.env);
