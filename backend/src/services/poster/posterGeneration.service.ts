import { Poster } from "../../models/Poster.js";
import { Template } from "../../models/Template.js";
import { GenerationLog } from "../../models/GenerationLog.js";
import { preparePhotos } from "../render/photoPrep.service.js";
import { suggestLayout } from "../gemini/layoutSuggestion.service.js";
import {
  buildPosterHtml,
  type PosterFormData,
} from "../render/html/buildPosterHtml.js";
import { renderPoster } from "../render/renderer.service.js";
import { uploadOutputs, cleanupOutputs } from "./outputStorage.service.js";
import { moderateText } from "../moderation/moderation.service.js";
import {
  generationFailure,
  type GenerationStage,
} from "./generationFailure.js";
import { logger } from "../../utils/logger.js";
export async function generatePoster(id: string) {
  const started = Date.now();
  let stage: GenerationStage = "validation";
  let failureCode: string | undefined;
  let prompt = "Template fallback; no model call";
  let tokensUsed = 0,
    success = false;
  try {
    const poster = await Poster.findById(id);
    if (!poster || poster.status !== "generating") return;
    if (poster.flagged) throw new Error("Poster flagged");
    const template = await Template.findById(poster.templateId);
    if (!template) throw new Error("Template unavailable");
    const data = poster.toObject().formData as PosterFormData;
    if (!data.photoConsent) throw new Error("Photo consent required");
    moderateText(data);
    stage = "photos";
    const photos = await preparePhotos(
      poster.uploadedPhotoUrls,
      poster.userId.toString(),
    );
    stage = "layout";
    const result = await suggestLayout(
      template.id,
      data.occasionType,
      poster.paletteHint,
      template.layoutConfig,
    );
    prompt = result.prompt;
    tokensUsed = result.tokensUsed;
    stage = "html";
    const html = await buildPosterHtml(
      template.layoutConfig,
      data,
      result.suggestion,
      photos,
    );
    stage = "render";
    const { png, pdf } = await renderPoster(html);
    stage = "storage";
    const assets = await uploadOutputs(png, pdf, id, poster.retryCount);
    stage = "save";
    const updated = await Poster.findOneAndUpdate(
      { _id: id, status: "generating" },
      { $set: { ...assets, status: "completed" }, $unset: { errorMessage: 1 } },
    );
    if (!updated) {
      await cleanupOutputs(
        assets.generatedImagePublicId,
        assets.generatedPdfPublicId,
      );
      return;
    }
    await cleanupOutputs(
      poster.generatedImagePublicId,
      poster.generatedPdfPublicId,
    );
    success = true;
  } catch (error) {
    const failure = generationFailure(stage, error);
    failureCode = failure.code;
    logger.error(
      JSON.stringify({
        event: "poster_generation_failed",
        posterId: id,
        stage,
        code: failureCode,
      }),
    );
    await Poster.findByIdAndUpdate(id, {
      $set: {
        status: "failed",
        errorMessage: failure.message + " (" + failure.code + ")",
      },
    }).catch(() => logger.error("Could not persist poster failure"));
  } finally {
    await GenerationLog.create({
      posterId: id,
      geminiPromptUsed: prompt,
      tokensUsed,
      latencyMs: Date.now() - started,
      success,
      failedStage: failureCode ? stage : undefined,
      failureCode,
    }).catch(() => logger.error("Could not write generation log"));
  }
}
export async function recoverInterruptedJobs() {
  await Poster.updateMany(
    { status: "generating" },
    {
      $set: {
        status: "failed",
        errorMessage:
          "সার্ভার পুনরায় চালু হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      },
    },
  );
}
