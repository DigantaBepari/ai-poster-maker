import { downloadFailure } from "./downloadFailure.js";
import { logger } from "../../utils/logger.js";
import { downloadQuery } from "../../validators/poster.validator.js";
import { ApiError } from "../../utils/ApiError.js";
import { getPoster, type Actor } from "../poster.service.js";
import { env } from "../../config/env.js";
export async function downloadPoster(id: string, user: Actor, query: unknown) {
  const { format } = downloadQuery.parse(query);
  const p = await getPoster(id, user);
  if (p.flagged && user.role !== "admin")
    throw new ApiError(
      403,
      "POSTER_FLAGGED",
      "চিহ্নিত পোস্টার ডাউনলোড করা যাবে না।",
    );
  if (p.status !== "completed")
    throw new ApiError(409, "POSTER_NOT_READY", "পোস্টার এখনও প্রস্তুত নয়।");
  const url = format === "png" ? p.generatedImageUrl : p.generatedPdfUrl;
  if (!url) throw new ApiError(404, "FILE_NOT_FOUND", "ফাইল পাওয়া যায়নি।");
  const parsed = new URL(url);
  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== "res.cloudinary.com" ||
    !parsed.pathname.startsWith("/" + env.CLOUDINARY_CLOUD_NAME + "/")
  )
    throw new ApiError(502, "INVALID_ASSET", "ফাইল সংযোগ সঠিক নয়।");
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    redirect: "error",
  });
  if (!response.ok || !response.body) {
    const failure = downloadFailure(format, response);
    logger.error(
      JSON.stringify({
        event: "poster_download_failed",
        format,
        upstreamStatus: response.status,
        code: failure.code,
      }),
    );
    throw failure;
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const part of response.body) {
    const b = Buffer.from(part);
    size += b.length;
    if (size > 40 * 1024 * 1024)
      throw new ApiError(502, "FILE_TOO_LARGE", "ফাইলের আকার সীমার বেশি।");
    chunks.push(b);
  }
  return {
    buffer: Buffer.concat(chunks),
    filename: "poster-" + id + "." + format,
    mime: format === "png" ? "image/png" : "application/pdf",
  };
}
