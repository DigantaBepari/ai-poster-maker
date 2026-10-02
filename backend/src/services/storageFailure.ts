import { ApiError } from "../utils/ApiError.js";
export function storageFailure(error: unknown): ApiError {
  const value =
    error && typeof error === "object"
      ? (error as Record<string, unknown>)
      : {};
  const status = value.http_code;
  const code = value.code;
  if (status === 401 || status === 403)
    return new ApiError(
      502,
      "STORAGE_AUTH_FAILED",
      "Cloudinary credential বা অনুমতি সঠিক নয়। Cloud name, API key ও API secret একই account-এর কিনা পরীক্ষা করুন।",
    );
  if (status === 429 || status === 420)
    return new ApiError(
      503,
      "STORAGE_LIMIT",
      "Cloudinary upload limit বা quota পূর্ণ হয়েছে। Dashboard পরীক্ষা করে পরে চেষ্টা করুন।",
    );
  if (
    status === 499 ||
    status === 504 ||
    [
      "ETIMEDOUT",
      "ECONNRESET",
      "ENOTFOUND",
      "EAI_AGAIN",
      "ECONNREFUSED",
    ].includes(String(code))
  )
    return new ApiError(
      503,
      "STORAGE_CONNECTION_FAILED",
      "সার্ভার থেকে Cloudinary-তে সংযোগ করা যায়নি। ইন্টারনেট বা firewall পরীক্ষা করে আবার চেষ্টা করুন।",
    );
  return new ApiError(
    502,
    "UPLOAD_FAILED",
    "Cloudinary ছবি গ্রহণ করেনি। Cloudinary account ও upload settings পরীক্ষা করুন।",
  );
}
