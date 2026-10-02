import { ApiError } from "../../utils/ApiError.js";
export function downloadFailure(format: "png" | "pdf", response: Response) {
  const detail = response.headers.get("x-cld-error") ?? "";
  if (
    format === "pdf" &&
    /blocked|untrusted|acl.*deny|pdf.*restrict/i.test(detail)
  )
    return new ApiError(
      502,
      "PDF_DELIVERY_BLOCKED",
      "Cloudinary PDF delivery বন্ধ করেছে। Cloudinary Console → Settings → Security থেকে Allow delivery of PDF and ZIP files চালু করুন।",
    );
  return new ApiError(
    502,
    "DOWNLOAD_FAILED",
    "ফাইল ডাউনলোড করা যায়নি।" +
      (format === "pdf"
        ? " Cloudinary-তে PDF delivery অনুমতি ও ফাইল পরীক্ষা করুন।"
        : ""),
  );
}
