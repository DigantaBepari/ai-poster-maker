import { z } from "zod";
const text = z
  .string()
  .trim()
  .min(1, "এই তথ্যটি প্রয়োজন।")
  .max(200, "সর্বোচ্চ ২০০ অক্ষর।");
export const editableSchema = z.object({
  name: text,
  designation: text,
  party: text,
  union: text,
  thana: text,
  district: text,
  headline: z
    .string()
    .trim()
    .min(1, "শিরোনাম লিখুন।")
    .max(500, "সর্বোচ্চ ৫০০ অক্ষর।"),
});
export const posterFormSchema = editableSchema.extend({
  photoConsent: z
    .boolean()
    .refine((v) => v, "ছবি ব্যবহারের অনুমতি নিশ্চিত করুন।"),
  uploadedPhotoUrls: z.array(z.url()).max(3),
  paletteHint: z.enum(["template", "green-red", "navy-gold", "monochrome"]),
});
export type PosterFields = z.infer<typeof posterFormSchema>;
export type EditableData = z.infer<typeof editableSchema>;
export interface PosterInput {
  templateId: string;
  formData: EditableData & { occasionType: string; photoConsent: boolean };
  uploadedPhotoUrls: string[];
  paletteHint: PosterFields["paletteHint"];
}
