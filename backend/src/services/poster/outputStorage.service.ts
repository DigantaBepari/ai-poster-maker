import { cloudinary } from "../../config/cloudinary.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
type Asset = { url: string; publicId: string };
function store(
  buffer: Buffer,
  id: string,
  format: "png" | "pdf",
): Promise<Asset> {
  if (
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET ||
    !env.CLOUDINARY_CLOUD_NAME
  )
    throw new ApiError(
      503,
      "STORAGE_UNAVAILABLE",
      "Cloudinary সেটআপ করা হয়নি।",
    );
  const resource_type = format === "png" ? "image" : "raw";
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          public_id: id + (format === "pdf" ? ".pdf" : ""),
          resource_type,
          type: "authenticated",
          ...(format === "png" ? { format: "png" } : {}),
          overwrite: false,
        },
        (err, result) => {
          if (err || !result)
            reject(new Error("Generated asset upload failed"));
          else
            resolve({
              publicId: result.public_id,
              url: cloudinary.url(result.public_id, {
                secure: true,
                resource_type,
                type: "authenticated",
                sign_url: true,
                ...(format === "png" ? { format: "png" } : {}),
              }),
            });
        },
      )
      .end(buffer);
  });
}
export async function uploadOutputs(
  png: Buffer,
  pdf: Buffer,
  posterId: string,
  attempt: number,
) {
  const id =
    "political-posters/generated/" +
    posterId +
    "/" +
    attempt +
    "-" +
    Date.now();
  const image = await store(png, id + "-image", "png");
  try {
    const document = await store(pdf, id + "-document", "pdf");
    return {
      generatedImageUrl: image.url,
      generatedPdfUrl: document.url,
      generatedImagePublicId: image.publicId,
      generatedPdfPublicId: document.publicId,
    };
  } catch (e) {
    await cleanupOutputs(image.publicId);
    throw e;
  }
}
export async function cleanupOutputs(
  imageId?: string | null,
  pdfId?: string | null,
) {
  await Promise.allSettled([
    imageId
      ? cloudinary.uploader.destroy(imageId, {
          resource_type: "image",
          type: "authenticated",
          invalidate: true,
        })
      : Promise.resolve(),
    pdfId
      ? cloudinary.uploader.destroy(pdfId, {
          resource_type: "raw",
          type: "authenticated",
          invalidate: true,
        })
      : Promise.resolve(),
  ]);
}
