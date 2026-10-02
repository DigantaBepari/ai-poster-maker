import type { LayoutConfig } from "../../types/shared.js";
export function layoutPrompt(
  occasion: string,
  paletteHint: string,
  layout: LayoutConfig,
) {
  return [
    "Suggest visual styling for a Bangla community poster. Return only the requested JSON.",
    "Do not draw images or text. Do not change geometry. Bengali shaping is handled by Chromium.",
    "Use readable colors; keep a dignified monochrome palette for condolence. No political claims or slogans.",
    "Subtitle must be a short neutral Bengali greeting, with no names or persuasive content.",
    JSON.stringify({
      occasion,
      paletteHint,
      defaultColors: layout.colorScheme,
      photoSlots: layout.photoSlots.length,
    }),
  ].join("\n");
}
