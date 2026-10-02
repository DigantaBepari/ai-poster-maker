import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { env } from "../../config/env.js";
import { suggestionSchema } from "./gemini.schema.js";
// Official SDK structured-output API: https://ai.google.dev/gemini-api/docs/structured-output
export async function requestLayout(prompt: string, signal: AbortSignal) {
  if (!env.GEMINI_API_KEY || !env.GEMINI_MODEL)
    throw new Error("Gemini not configured");
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(suggestionSchema),
      abortSignal: signal,
      httpOptions: { timeout: 15000 },
      temperature: 0.2,
    },
  });
  return {
    text: response.text ?? "",
    tokensUsed: response.usageMetadata?.totalTokenCount ?? 0,
  };
}
