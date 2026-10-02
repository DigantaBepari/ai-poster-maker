import { beforeAll, afterAll, it, expect, vi } from "vitest";
import { setupTestApp, teardownTestApp, formData } from "./setup.js";
vi.mock("../src/services/render/photoPrep.service.js", () => ({
  preparePhotos: vi.fn().mockResolvedValue([]),
  assertPhotoUrl: vi.fn(),
}));
vi.mock("../src/services/render/renderer.service.js", () => ({
  renderPoster: vi
    .fn()
    .mockResolvedValue({ png: Buffer.from("png"), pdf: Buffer.from("pdf") }),
}));
vi.mock("../src/services/poster/outputStorage.service.js", () => ({
  uploadOutputs: vi.fn().mockResolvedValue({
    generatedImageUrl: "https://res.cloudinary.com/demo/image.png",
    generatedPdfUrl: "https://res.cloudinary.com/demo/doc.pdf",
    generatedImagePublicId: "image-id",
    generatedPdfPublicId: "pdf-id",
  }),
  cleanupOutputs: vi.fn(),
}));
vi.mock("../src/services/gemini/gemini.client.js", () => ({
  requestLayout: vi.fn().mockRejectedValue(new Error("No Gemini key")),
}));
let ctx: Awaited<ReturnType<typeof setupTestApp>>;
beforeAll(async () => {
  ctx = await setupTestApp();
}, 120000);
afterAll(() => teardownTestApp(ctx?.mongo));
it("completes the orchestrator with fallback styling and logs the job", async () => {
  const { Poster } = await import("../src/models/Poster.js");
  const { GenerationLog } = await import("../src/models/GenerationLog.js");
  const { generatePoster } =
    await import("../src/services/poster/posterGeneration.service.js");
  const p = await Poster.create({
    userId: ctx.userId,
    templateId: ctx.templateId,
    formData,
    status: "generating",
    uploadedPhotoUrls: [],
  });
  await generatePoster(p.id);
  expect((await Poster.findById(p.id))?.status).toBe("completed");
  const log = await GenerationLog.findOne({ posterId: p.id });
  expect(log?.success).toBe(true);
  expect(log?.tokensUsed).toBe(0);
  expect(log?.geminiPromptUsed).toContain("Bangla");
});
it("marks failed and writes a failure log when storage fails", async () => {
  const { uploadOutputs } =
    await import("../src/services/poster/outputStorage.service.js");
  vi.mocked(uploadOutputs).mockRejectedValueOnce(new Error("storage down"));
  const { Poster } = await import("../src/models/Poster.js");
  const { GenerationLog } = await import("../src/models/GenerationLog.js");
  const { generatePoster } =
    await import("../src/services/poster/posterGeneration.service.js");
  const p = await Poster.create({
    userId: ctx.userId,
    templateId: ctx.templateId,
    formData,
    status: "generating",
    uploadedPhotoUrls: [],
  });
  await generatePoster(p.id);
  const failed = await Poster.findById(p.id);
  expect(failed?.status).toBe("failed");
  expect(failed?.errorMessage).toContain("GENERATION_STORAGE_FAILED");
  expect(failed?.errorMessage).not.toContain("storage down");
  const log = await GenerationLog.findOne({ posterId: p.id });
  expect(log?.failedStage).toBe("storage");
  expect(log?.failureCode).toBe("GENERATION_STORAGE_FAILED");
  expect((await GenerationLog.findOne({ posterId: p.id }))?.success).toBe(
    false,
  );
});
