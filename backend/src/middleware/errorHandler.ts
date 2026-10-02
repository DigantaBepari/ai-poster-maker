import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: err.issues,
      },
    });
    return;
  }
  if (err instanceof MulterError) {
    res
      .status(400)
      .json({ error: { code: "UPLOAD_ERROR", message: err.message } });
    return;
  }
  if (err?.code === 11000) {
    res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "Email or phone already registered",
      },
    });
    return;
  }
  if (err?.name === "CastError") {
    res
      .status(400)
      .json({ error: { code: "INVALID_ID", message: "Invalid resource ID" } });
    return;
  }
  const status =
    err instanceof ApiError ? err.status : err?.status === 400 ? 400 : 500;
  if (status === 500) logger.error("Unhandled request error");
  res.status(status).json({
    error: {
      ...(err instanceof ApiError && err.details
        ? { details: err.details }
        : {}),
      code:
        err instanceof ApiError
          ? err.code
          : status === 400
            ? "BAD_REQUEST"
            : "INTERNAL_ERROR",
      message:
        err instanceof ApiError
          ? err.message
          : status === 400
            ? "Invalid request body"
            : "An unexpected error occurred",
    },
  });
};
