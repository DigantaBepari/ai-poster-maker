import sharp from "sharp";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
const LIMIT = 5 * 1024 * 1024;
export function assertPhotoUrl(value: string, userId?: string) {
  const u = new URL(value);
  if (
    u.protocol !== "https:" ||
    u.hostname !== "res.cloudinary.com" ||
    u.port ||
    u.username ||
    u.password ||
    !u.pathname.startsWith(
      "/" + env.CLOUDINARY_CLOUD_NAME + "/image/upload/",
    ) ||
    (userId && !u.pathname.includes("/political-posters/" + userId + "/"))
  )
    throw new ApiError(
      400,
      "INVALID_PHOTO",
      "এই ছবি ব্যবহার করা যাবে না। নিজের আপলোড করা ছবি ব্যবহার করুন।",
    );
}
export async function preparePhotos(urls: string[], userId: string) {
  return Promise.all(
    urls.map(async (url) => {
      assertPhotoUrl(url, userId);
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        redirect: "error",
      });
      if (!response.ok || !response.body) throw new Error("Photo unavailable");
      const length = Number(response.headers.get("content-length"));
      if (length > LIMIT) throw new Error("Photo too large");
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const part of response.body) {
        const b = Buffer.from(part);
        size += b.length;
        if (size > LIMIT) throw new Error("Photo too large");
        chunks.push(b);
      }
      const image = sharp(Buffer.concat(chunks), {
        limitInputPixels: 40000000,
      });
      const metadata = await image.metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format ?? ""))
        throw new Error("Unsupported image");
      const buffer = await image
        .rotate()
        .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();
      return "data:image/jpeg;base64," + buffer.toString("base64");
    }),
  );
}
