import { z } from "zod";
import { occasions } from "../config/constants.js";
const text = z.string().trim().min(1).max(200);
export const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/);
export const editableFields = z
  .object({
    name: text,
    designation: text,
    party: text,
    union: text,
    thana: text,
    district: text,
    headline: z.string().trim().min(1).max(500),
  })
  .strict();
export const formDataSchema = editableFields
  .extend({ occasionType: z.enum(occasions), photoConsent: z.literal(true) })
  .strict();
export const posterSchema = z
  .object({
    templateId: objectId,
    formData: formDataSchema,
    paletteHint: z
      .enum(["template", "green-red", "navy-gold", "monochrome"])
      .default("template"),
    uploadedPhotoUrls: z
      .array(
        z
          .url()
          .refine(
            (v) =>
              new URL(v).hostname === "res.cloudinary.com" &&
              new URL(v).protocol === "https:",
          ),
      )
      .max(3)
      .default([]),
  })
  .strict();
export const regenerateSchema = z
  .object({ formData: editableFields.partial().default({}) })
  .strict()
  .default({ formData: {} });
export const flagSchema = z.object({ flagged: z.boolean() }).strict();
export const downloadQuery = z.object({
  format: z.enum(["png", "pdf"]).default("png"),
});
export const adminPosterQuery = z.object({
  flagged: z.enum(["true", "false"]).optional(),
});
