import { occasionText } from "../../../config/occasionText.js";
import { readableColor } from "./contrast.js";
import type { z } from "zod";
import type { formDataSchema } from "../../../validators/poster.validator.js";
import { layoutSchema } from "../../../validators/template.validator.js";
import type { LayoutConfig } from "../../../types/shared.js";
import {
  suggestionSchema,
  type Suggestion,
} from "../../gemini/gemini.schema.js";
import { decorations } from "./decorations.js";
import { posterStyles } from "./styles.js";
import { embeddedFonts } from "./fonts.js";
import { escapeHtml } from "./escape.js";
export type PosterFormData = z.infer<typeof formDataSchema>;
export async function buildPosterHtml(
  layout: LayoutConfig,
  data: PosterFormData,
  suggestion: Suggestion,
  photos: string[],
) {
  layout = layoutSchema.parse(layout);
  suggestion = suggestionSchema.parse(suggestion);
  const width = 1200,
    height = 1600;
  const sx = Math.min(
      width / layout.canvas.width,
      height / layout.canvas.height,
    ),
    sy = sx;
  const offsetX = (width - layout.canvas.width * sx) / 2,
    offsetY = (height - layout.canvas.height * sy) / 2;
  const values: Record<string, string> = {
    ...data,
    photoConsent: String(data.photoConsent),
    occasion: occasionText[data.occasionType],
    message: suggestion.subtitle,
    location: [data.union, data.thana, data.district].join(" · "),
  };
  const c = suggestion.colorScheme;
  const bg = "linear-gradient(" + c.primary + "," + c.background + ")";
  const slots = layout.textSlots
    .map((slot) => {
      const lineHeight = slot.fontSize * 1.6;
      const top = slot.y - slot.fontSize * 1.15;
      const next = layout.textSlots
        .filter((t) => t.y > slot.y)
        .sort((a, b) => a.y - b.y)[0];
      const nextPhoto = layout.photoSlots
        .filter((p) => p.y > top)
        .sort((a, b) => a.y - b.y)[0];
      const boundary = Math.min(
        next ? next.y - next.fontSize * 1.15 - 5 : layout.canvas.height - 30,
        nextPhoto ? nextPhoto.y - 8 : layout.canvas.height,
      );
      const h = Math.max(20, Math.min(lineHeight, boundary - top));
      const font = [
        "Noto Sans Bengali",
        "Hind Siliguri",
        "Tiro Bangla",
      ].includes(slot.fontFamily)
        ? slot.fontFamily
        : "Noto Sans Bengali";
      const display = slot.key === "headline" ? "Hind Siliguri" : font;
      return (
        '<div class="slot" data-fit="true" style="left:' +
        slot.x +
        "px;top:" +
        top +
        "px;width:" +
        slot.w +
        "px;height:" +
        h +
        "px;font-size:" +
        slot.fontSize +
        "px;font-family:&quot;" +
        display +
        "&quot;;color:" +
        readableColor(
          slot.color,
          slot.y >= 830 ? [c.footerBg] : [c.primary, c.background],
        ) +
        ";text-align:" +
        slot.align +
        ";justify-content:" +
        (slot.align === "left"
          ? "flex-start"
          : slot.align === "right"
            ? "flex-end"
            : "center") +
        '"><span>' +
        escapeHtml(values[slot.key] ?? "") +
        "</span></div>"
      );
    })
    .join("");
  const portraits = layout.photoSlots
    .map((slot, i) => {
      const style =
        "left:" +
        slot.x +
        "px;top:" +
        slot.y +
        "px;width:" +
        slot.w +
        "px;height:" +
        slot.h +
        "px;border-radius:" +
        (slot.shape === "rectangle" ? "12px" : "50%") +
        ";object-position:" +
        (suggestion.photoCrop.find((c) => c.slot === i)?.position ?? "center");
      const photo = photos[i];
      return photo &&
        /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo)
        ? '<img class="photo" src="' +
            photo +
            '" style="' +
            style +
            '" alt=""/>'
        : '<div class="photo placeholder" style="' + style + '">●</div>';
    })
    .join("");
  return (
    '<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src &apos;none&apos;; img-src data:; font-src data:; style-src &apos;unsafe-inline&apos;"><style>' +
    (await embeddedFonts()) +
    posterStyles(width, height, c.background) +
    '</style></head><body><main id="poster"><div class="canvas" style="width:' +
    layout.canvas.width +
    "px;height:" +
    layout.canvas.height +
    "px;left:" +
    offsetX +
    "px;top:" +
    offsetY +
    "px;transform:scale(" +
    sx +
    "," +
    sy +
    ");background:" +
    bg +
    ";--accent:" +
    c.accent +
    '">' +
    decorations(layout, suggestion) +
    portraits +
    slots +
    '<div class="watermark">পোস্টার AI</div></div></main></body></html>'
  );
}
