import { ApiError } from "../../utils/ApiError.js";
export type GenerationStage =
  "validation" | "photos" | "layout" | "html" | "render" | "storage" | "save";
const messages: Record<GenerationStage, string> = {
  validation: "পোস্টারের তথ্য যাচাই করা যায়নি।",
  photos: "আপলোড করা ছবি পড়া যায়নি। ছবি পুনরায় আপলোড করে চেষ্টা করুন।",
  layout: "পোস্টারের বিন্যাস তৈরি করা যায়নি।",
  html: "টেমপ্লেট থেকে পোস্টার তৈরি করা যায়নি।",
  render:
    "পোস্টারের PNG/PDF তৈরি করা যায়নি। সার্ভারের Chromium সেটআপ পরীক্ষা করুন।",
  storage:
    "পোস্টারের ফাইল Cloudinary-তে সংরক্ষণ করা যায়নি। Cloudinary সেটআপ ও সংযোগ পরীক্ষা করুন।",
  save: "পোস্টারের ফলাফল ডেটাবেসে সংরক্ষণ করা যায়নি।",
};
export function generationFailure(stage: GenerationStage, error: unknown) {
  // Only fixed local codes are exposed; provider messages may contain credentials or URLs.
  const code =
    error instanceof ApiError && error.code === "STORAGE_UNAVAILABLE"
      ? "STORAGE_UNAVAILABLE"
      : "GENERATION_" + stage.toUpperCase() + "_FAILED";
  return { code, message: messages[stage] };
}
