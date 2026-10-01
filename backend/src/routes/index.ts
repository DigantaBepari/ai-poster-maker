import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { uploadRoutes } from "./upload.routes.js";
import { templateRoutes } from "./template.routes.js";
import { posterRoutes } from "./poster.routes.js";
import { adminRoutes } from "./admin.routes.js";
import { healthRoutes } from "./health.routes.js";
export const routes = Router()
  .use("/health", healthRoutes)
  .use("/auth", authRoutes)
  .use("/upload", uploadRoutes)
  .use("/templates", templateRoutes)
  .use("/posters", posterRoutes)
  .use("/admin", adminRoutes);
