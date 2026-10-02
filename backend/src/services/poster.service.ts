import { Poster } from "../models/Poster.js";
import { getTemplate } from "./template.service.js";
import {
  posterSchema,
  adminPosterQuery,
} from "../validators/poster.validator.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";
import { moderateText } from "./moderation/moderation.service.js";
import { assertPhotoUrl } from "./render/photoPrep.service.js";
import { posterQueue } from "./poster/posterQueue.js";
import { generatePoster } from "./poster/posterGeneration.service.js";
import { cleanupOutputs } from "./poster/outputStorage.service.js";
export type Actor = { id: string; role: "user" | "admin" };
export async function schedulePoster(id: string) {
  try {
    posterQueue.enqueue(() => generatePoster(id));
  } catch (e) {
    await Poster.findByIdAndUpdate(id, {
      status: "failed",
      errorMessage: "পোস্টার তৈরির সারি পূর্ণ। আবার চেষ্টা করুন।",
    });
    throw e;
  }
}
export async function createPoster(body: unknown, user: Actor) {
  const input = posterSchema.parse(body);
  moderateText(input.formData);
  posterQueue.assertAvailable();
  const t = await getTemplate(input.templateId);
  if (t.occasionType !== input.formData.occasionType)
    throw new ApiError(
      400,
      "OCCASION_MISMATCH",
      "উপলক্ষ ও টেমপ্লেট এক হতে হবে।",
    );
  if (input.uploadedPhotoUrls.length > t.layoutConfig.photoSlots.length)
    throw new ApiError(
      400,
      "TOO_MANY_PHOTOS",
      "এই টেমপ্লেটে অতিরিক্ত ছবি দেওয়া যাবে না।",
    );
  input.uploadedPhotoUrls.forEach((url) => assertPhotoUrl(url, user.id));
  const p = await Poster.create({
    ...input,
    userId: user.id,
    status: "generating",
  });
  await schedulePoster(p._id.toString());
  return p;
}
export async function getPoster(id: string, user: Actor) {
  const p = await Poster.findById(id);
  if (!p) throw new ApiError(404, "NOT_FOUND", "পোস্টার পাওয়া যায়নি।");
  if (user.role !== "admin" && p.userId.toString() !== user.id)
    throw new ApiError(403, "FORBIDDEN", "এই পোস্টারে প্রবেশাধিকার নেই।");
  return p;
}
export async function readPoster(id: string, user: Actor) {
  const p = await getPoster(id, user);
  const value = p.toObject();
  if (p.flagged && user.role !== "admin") {
    delete value.generatedImageUrl;
    delete value.generatedPdfUrl;
  }
  return {
    ...value,
    maxRegenerations: env.MAX_REGENERATIONS,
    remainingRegenerations: Math.max(0, env.MAX_REGENERATIONS - p.retryCount),
  };
}
export async function listPosters(userId: string, user: Actor) {
  if (user.role !== "admin" && user.id !== userId)
    throw new ApiError(403, "FORBIDDEN", "এই তালিকায় প্রবেশাধিকার নেই।");
  const values = await Poster.find({ userId })
    .sort({ createdAt: -1 })
    .limit(100);
  return values.map((p) => {
    const v = p.toObject();
    if (p.flagged && user.role !== "admin") {
      delete v.generatedImageUrl;
      delete v.generatedPdfUrl;
    }
    return v;
  });
}
export async function deletePoster(id: string, user: Actor) {
  const p = await getPoster(id, user);
  const deleted = await Poster.findOneAndDelete({
    _id: p._id,
    status: { $ne: "generating" },
  });
  if (!deleted)
    throw new ApiError(
      409,
      "GENERATION_IN_PROGRESS",
      "পোস্টার তৈরি হচ্ছে। শেষ হলে মুছতে পারবেন।",
    );
  await cleanupOutputs(p.generatedImagePublicId, p.generatedPdfPublicId);
}
export const adminPosters = (query: unknown) => {
  const q = adminPosterQuery.parse(query);
  return Poster.find(
    q.flagged === undefined ? {} : { flagged: q.flagged === "true" },
  )
    .sort({ createdAt: -1 })
    .limit(100);
};
export async function flagPoster(id: string, flagged: boolean) {
  const p = await Poster.findByIdAndUpdate(id, { flagged }, { new: true });
  if (!p) throw new ApiError(404, "NOT_FOUND", "Poster not found");
  return p;
}

export { regeneratePoster } from "./poster/regeneration.service.js";
