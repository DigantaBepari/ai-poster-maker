import { Router } from "express";
import * as c from "../controllers/poster.controller.js";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  posterSchema,
  regenerateSchema,
} from "../validators/poster.validator.js";
import { generationRateLimiter } from "../middleware/generationRateLimiter.js";
export const posterRoutes = Router()
  .use(auth)
  .post("/", generationRateLimiter, validate(posterSchema), c.create)
  .get("/user/:userId", c.list)
  .get("/:id", c.get)
  .get("/:id/download", c.download)
  .post(
    "/:id/regenerate",
    generationRateLimiter,
    validate(regenerateSchema),
    c.regenerate,
  )
  .delete("/:id", c.remove);
