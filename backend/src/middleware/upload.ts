import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype))
      cb(null, true);
    else cb(new ApiError(400, "INVALID_IMAGE", "Use JPEG, PNG, or WebP"));
  },
});
