import { storageFailure } from "./storageFailure.js";
import { logger } from "../utils/logger.js";
import { cloudinary } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
export async function uploadPhoto(
  file: Express.Multer.File | undefined,
  userId: string,
  photoConsent: unknown,
) {
  if (photoConsent !== "true")
    throw new ApiError(
      422,
      "PHOTO_CONSENT_REQUIRED",
      "ছবি ব্যবহারের অনুমতি নিশ্চিত করুন।",
    );
  if (!file) throw new ApiError(400, "MISSING_PHOTO", "Photo is required");
  const b = file.buffer;
  const jpeg = b[0] === 255 && b[1] === 216 && b[2] === 255;
  const png = b
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp =
    b.toString("ascii", 0, 4) === "RIFF" &&
    b.toString("ascii", 8, 12) === "WEBP";
  if (!jpeg && !png && !webp)
    throw new ApiError(400, "INVALID_IMAGE", "Invalid image contents");
  if (
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET ||
    !env.CLOUDINARY_CLOUD_NAME
  )
    throw new ApiError(
      503,
      "STORAGE_UNAVAILABLE",
      "Cloudinary is not configured",
    );
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "political-posters/" + userId, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          const failure = storageFailure(error);
          logger.error(
            JSON.stringify({
              event: "photo_upload_failed",
              code: failure.code,
            }),
          );
          reject(failure);
        } else resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(b);
  });
}
