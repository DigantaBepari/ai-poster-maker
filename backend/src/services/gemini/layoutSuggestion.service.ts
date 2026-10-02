import { defaultSuggestion } from "./defaults.js";
import { createHash } from "node:crypto";
import type { LayoutConfig } from "../../types/shared.js";
import { suggestionSchema, type SuggestionResult } from "./gemini.schema.js";
import { layoutPrompt } from "./gemini.prompts.js";
import { requestLayout } from "./gemini.client.js";
import { moderateText } from "../moderation/moderation.service.js";
const cache = new Map<string, { expires: number; result: SuggestionResult }>();
export async function suggestLayout(
  templateId: string,
  occasion: string,
  paletteHint: string,
  layout: LayoutConfig,
): Promise<SuggestionResult> {
  const prompt = layoutPrompt(occasion, paletteHint, layout);
  const key = createHash("sha256")
    .update(templateId + prompt)
    .digest("hex");
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now())
    return {
      ...entry.result,
      source: entry.result.source === "fallback" ? "fallback" : "cache",
      tokensUsed: 0,
    };
  const fallback: SuggestionResult = {
    suggestion: defaultSuggestion(layout, occasion),
    prompt,
    tokensUsed: 0,
    source: "fallback",
  };
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let tokensUsed = 0;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error("Layout timeout"));
      }, 15000);
    });
    const response = await Promise.race([
      requestLayout(prompt, controller.signal),
      timeout,
    ]);
    tokensUsed = response.tokensUsed;
    const suggestion = suggestionSchema.parse(JSON.parse(response.text));
    moderateText({ subtitle: suggestion.subtitle });
    const result: SuggestionResult = {
      suggestion,
      prompt,
      tokensUsed: response.tokensUsed,
      source: "gemini",
    };
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    cache.set(key, { expires: Date.now() + 60 * 60 * 1000, result });
    return result;
  } catch {
    const result = { ...fallback, tokensUsed };
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    cache.set(key, { expires: Date.now() + 30000, result });
    return result;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
