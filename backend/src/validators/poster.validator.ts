import { z } from "zod";
import { occasions } from "../config/constants.js";
const text = z.string().trim().min(1).max(200);
export const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/);
export const posterSchema = z
  .object({
    templateId: objectId,
    formData: z
      .object({
        name: text,
        designation: text,
        party: text,
        union: text,
        thana: text,
        district: text,
        occasionType: z.enum(occasions),
        headline: z.string().trim().min(1).max(500),
      })
      .strict(),
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
export const flagSchema = z.object({ flagged: z.boolean() }).strict();
