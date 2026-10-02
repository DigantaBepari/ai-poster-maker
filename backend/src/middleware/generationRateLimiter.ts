import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";
export const generationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.GENERATION_RATE_LIMIT,
  keyGenerator: (req) => req.user!.id,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: {
      code: "GENERATION_RATE_LIMIT",
      message:
        "প্রতি ঘণ্টায় পোস্টার তৈরির সীমা অতিক্রম করেছেন। পরে চেষ্টা করুন।",
    },
  },
});
