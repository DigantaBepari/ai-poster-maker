import { z } from "zod";
import { occasions } from "../config/constants.js";
const positive = z.number().positive();
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const layoutSchema = z
  .object({
    canvas: z.object({ width: positive, height: positive }).strict(),
    photoSlots: z
      .array(
        z
          .object({
            x: z.number().nonnegative(),
            y: z.number().nonnegative(),
            w: positive,
            h: positive,
            shape: z.enum(["circle", "oval", "rectangle"]),
          })
          .strict(),
      )
      .max(3),
    textSlots: z.array(
      z
        .object({
          key: z.string().min(1),
          x: z.number(),
          y: z.number(),
          w: positive,
          fontSize: positive,
          fontFamily: z.string().min(1),
          color,
          align: z.enum(["left", "center", "right"]),
        })
        .strict(),
    ),
    colorScheme: z
      .object({
        primary: color,
        secondary: color,
        accent: color,
        background: color,
        footerBg: color,
      })
      .strict(),
    decorations: z.array(
      z
        .object({
          type: z.enum([
            "border",
            "rice-paddy",
            "circle",
            "footer",
            "flourish",
          ]),
          x: z.number(),
          y: z.number(),
          w: positive,
          h: positive,
          color,
        })
        .strict(),
    ),
  })
  .strict();
export const templateSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    occasionType: z.enum(occasions),
    thumbnailUrl: z
      .string()
      .refine((v) => v.startsWith("/templates/") || URL.canParse(v)),
    layoutConfig: layoutSchema,
    isActive: z.boolean().default(true),
  })
  .strict();
export const templatePatchSchema = templateSchema.partial();
export const occasionQuery = z.object({
  occasionType: z.enum(occasions).optional(),
});
