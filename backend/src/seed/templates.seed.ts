import { Template } from "../models/Template.js";
import { templateSchema } from "../validators/template.validator.js";
import type { LayoutConfig } from "../types/shared.js";
const text = (key: string, y: number, fontSize: number, color = "#ffffff") => ({
  key,
  x: 60,
  y,
  w: 680,
  fontSize,
  fontFamily: "Noto Sans Bengali",
  color,
  align: "center" as const,
});
function layout(kind: string): LayoutConfig {
  const dark = kind === "condolence";
  const accent = dark ? "#bdbdbd" : "#f2c94c";
  return {
    canvas: { width: 800, height: 1000 },
    photoSlots: dark
      ? [{ x: 250, y: 340, w: 300, h: 360, shape: "oval" }]
      : kind === "victory-day"
        ? [
            { x: 115, y: 335, w: 170, h: 170, shape: "circle" },
            { x: 295, y: 295, w: 210, h: 210, shape: "circle" },
            { x: 515, y: 335, w: 170, h: 170, shape: "circle" },
          ]
        : [
            { x: 155, y: 335, w: 220, h: 220, shape: "circle" },
            { x: 425, y: 335, w: 220, h: 220, shape: "circle" },
          ],
    textSlots: [
      text("occasion", 130, 26, accent),
      text("headline", dark ? 240 : 225, dark ? 76 : 64),
      text("party", dark ? 310 : 278, 26),
      text("message", 775, 30),
      text("name", 885, 40),
      text("designation", 925, 26),
      text("location", 958, 20, accent),
    ],
    colorScheme: {
      primary: dark ? "#2b2b2b" : "#0b6b3a",
      secondary: dark ? "#0d0d0d" : "#06402a",
      accent,
      background: dark ? "#0d0d0d" : "#06402a",
      footerBg: dark ? "#1b1b1b" : "#d6212a",
    },
    decorations: [
      { type: "border", x: 18, y: 18, w: 764, h: 964, color: accent },
      {
        type: "footer",
        x: 30,
        y: 830,
        w: 740,
        h: 140,
        color: dark ? "#1b1b1b" : "#d6212a",
      },
      ...(dark
        ? [
            {
              type: "flourish" as const,
              x: 40,
              y: 40,
              w: 720,
              h: 80,
              color: accent,
            },
          ]
        : [
            {
              type: "circle" as const,
              x: 140,
              y: 210,
              w: 520,
              h: 520,
              color: "#d6212a",
            },
            {
              type: "rice-paddy" as const,
              x: 60,
              y: 600,
              w: 110,
              h: 160,
              color: accent,
            },
            {
              type: "rice-paddy" as const,
              x: 630,
              y: 600,
              w: 110,
              h: 160,
              color: accent,
            },
          ]),
    ],
  };
}
export const seedTemplates = [
  { title: "মহান বিজয় দিবস", occasionType: "victory-day" },
  { title: "শোক ও শ্রদ্ধাঞ্জলি", occasionType: "condolence" },
  { title: "নির্বাচনী অঙ্গীকার", occasionType: "election-campaign" },
].map((t) =>
  templateSchema.parse({
    ...t,
    thumbnailUrl: "/templates/" + t.occasionType + ".svg",
    layoutConfig: layout(t.occasionType),
    isActive: true,
  }),
);
export async function seedTemplateRecords() {
  for (const t of seedTemplates)
    await Template.findOneAndUpdate(
      { occasionType: t.occasionType, title: t.title },
      { $set: t },
      { upsert: true, runValidators: true },
    );
}
