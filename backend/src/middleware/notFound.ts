import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";
export const notFound: RequestHandler = (_req, _res, next) =>
  next(new ApiError(404, "NOT_FOUND", "Route not found"));
