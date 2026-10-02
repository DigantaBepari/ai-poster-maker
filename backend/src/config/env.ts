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
    GENERATION_RATE_LIMIT: z.preprocess(
      defaults,
      z.coerce.number().int().min(1).default(10),
    ),
    GENERATION_CONCURRENCY: z.preprocess(
      defaults,
      z.coerce.number().int().min(1).max(2).default(1),
    ),
    PUPPETEER_EXECUTABLE_PATH: optional,
    TRUST_PROXY_HOPS: z.preprocess(
      defaults,
      z.coerce.number().int().min(0).max(5).default(0),
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
      z
        .string()
        .min(8)
        .max(72)
        .refine(
          (v) => Buffer.byteLength(v) <= 72,
          "Password exceeds bcrypt byte limit",
        )
        .optional(),
    ),
    MAX_REGENERATIONS: z.preprocess(
      defaults,
      z.coerce.number().int().min(0).default(3),
    ),
  })
  .parse(process.env);
