import { z } from "zod";
import { layoutSchema } from "../../validators/template.validator.js";
export const suggestionSchema = z
  .object({
    colorScheme: layoutSchema.shape.colorScheme,
    photoCrop: z
      .array(
        z
          .object({
            slot: z.number().int().min(0).max(2),
            position: z.enum(["center", "top", "bottom"]),
          })
          .strict(),
      )
      .max(3),
    decorations: z
      .array(z.enum(["rice-paddy", "floral", "doves", "flag-bands"]))
      .max(3),
    subtitle: z.string().max(100),
  })
  .strict();
export type Suggestion = z.infer<typeof suggestionSchema>;
export interface SuggestionResult {
  suggestion: Suggestion;
  prompt: string;
  tokensUsed: number;
  source: "gemini" | "cache" | "fallback";
}
