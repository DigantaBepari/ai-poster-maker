import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";
export const requireAdmin: RequestHandler = (req, _res, next) =>
  next(
    req.user?.role === "admin"
      ? undefined
      : new ApiError(403, "FORBIDDEN", "Admin access required"),
  );
