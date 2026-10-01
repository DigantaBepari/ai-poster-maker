import { Poster } from "../models/Poster.js";
import { getTemplate } from "./template.service.js";
import { posterSchema } from "../validators/poster.validator.js";
import { ApiError } from "../utils/ApiError.js";
type Actor = { id: string; role: "user" | "admin" };
export async function createPoster(body: unknown, user: Actor) {
  const input = posterSchema.parse(body);
  const t = await getTemplate(input.templateId);
  if (t.occasionType !== input.formData.occasionType)
    throw new ApiError(
      400,
      "OCCASION_MISMATCH",
      "Template and occasion must match",
    );
  if (input.uploadedPhotoUrls.length > t.layoutConfig.photoSlots.length)
    throw new ApiError(
      400,
      "TOO_MANY_PHOTOS",
      "Too many photos for this template",
    );
  return Poster.create({ ...input, userId: user.id, status: "draft" });
}
export async function getPoster(id: string, user: Actor) {
  const p = await Poster.findById(id);
  if (!p) throw new ApiError(404, "NOT_FOUND", "Poster not found");
  if (user.role !== "admin" && p.userId.toString() !== user.id)
    throw new ApiError(403, "FORBIDDEN", "Access denied");
  return p;
}
export function listPosters(userId: string, user: Actor) {
  if (user.role !== "admin" && user.id !== userId)
    throw new ApiError(403, "FORBIDDEN", "Access denied");
  return Poster.find({ userId }).sort({ createdAt: -1 }).limit(100);
}
export async function deletePoster(id: string, user: Actor) {
  const p = await getPoster(id, user);
  await p.deleteOne();
}
// Prompt 2 fills in generation, retry accounting, Gemini, rendering, and GenerationLog.
export async function regeneratePoster(id: string, user: Actor) {
  await getPoster(id, user);
  throw new ApiError(
    501,
    "GENERATION_NOT_IMPLEMENTED",
    "Generation is planned for prompt 2",
  );
}
export const adminPosters = (flagged?: boolean) =>
  Poster.find(flagged === undefined ? {} : { flagged })
    .sort({ createdAt: -1 })
    .limit(100);
export async function flagPoster(id: string, flagged: boolean) {
  const p = await Poster.findByIdAndUpdate(id, { flagged }, { new: true });
  if (!p) throw new ApiError(404, "NOT_FOUND", "Poster not found");
  return p;
}
