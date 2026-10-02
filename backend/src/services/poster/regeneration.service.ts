import { Poster } from "../../models/Poster.js";
import { regenerateSchema } from "../../validators/poster.validator.js";
import { ApiError } from "../../utils/ApiError.js";
import { env } from "../../config/env.js";
import { moderateText } from "../moderation/moderation.service.js";
import { posterQueue } from "./posterQueue.js";
import { getPoster, schedulePoster, type Actor } from "../poster.service.js";
export async function regeneratePoster(id: string, user: Actor, body: unknown) {
  const patch = regenerateSchema.parse(body ?? {});
  const p = await getPoster(id, user);
  if (p.flagged)
    throw new ApiError(
      403,
      "POSTER_FLAGGED",
      "চিহ্নিত পোস্টার পুনরায় তৈরি করা যাবে না।",
    );
  if (p.status === "generating")
    throw new ApiError(
      409,
      "GENERATION_IN_PROGRESS",
      "পোস্টার ইতিমধ্যে তৈরি হচ্ছে।",
    );
  if (p.retryCount >= env.MAX_REGENERATIONS)
    throw new ApiError(
      429,
      "RETRY_LIMIT",
      "পুনরায় তৈরির সীমা শেষ। অবশিষ্ট: ০",
      { remainingRegenerations: 0 },
    );
  const data = { ...p.toObject().formData, ...patch.formData };
  moderateText(data);
  if (!data.photoConsent)
    throw new ApiError(
      422,
      "PHOTO_CONSENT_REQUIRED",
      "ছবি ব্যবহারের অনুমতি প্রয়োজন।",
    );
  posterQueue.assertAvailable();
  const updated = await Poster.findOneAndUpdate(
    {
      _id: id,
      flagged: false,
      status: { $ne: "generating" },
      retryCount: { $lt: env.MAX_REGENERATIONS },
    },
    {
      $set: { formData: data, status: "generating" },
      $inc: { retryCount: 1 },
      $unset: { errorMessage: 1 },
    },
    { new: true, runValidators: true },
  );
  if (!updated)
    throw new ApiError(
      409,
      "POSTER_CHANGED",
      "পোস্টার পরিবর্তিত হয়েছে। আবার লোড করুন।",
    );
  await schedulePoster(id);
  return {
    ...updated.toObject(),
    remainingRegenerations: env.MAX_REGENERATIONS - updated.retryCount,
  };
}
