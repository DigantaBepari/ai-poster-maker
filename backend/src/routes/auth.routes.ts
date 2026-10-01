import { Router } from "express";
import * as c from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
export const authRoutes = Router()
  .post("/register", authRateLimiter, validate(registerSchema), c.register)
  .post("/login", authRateLimiter, validate(loginSchema), c.login)
  .get("/me", auth, c.me);
