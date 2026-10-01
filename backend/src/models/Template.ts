import { Schema, model } from "mongoose";
import { occasions } from "../config/constants.js";
import type { LayoutConfig } from "../types/shared.js";
interface Data {
  title: string;
  occasionType: (typeof occasions)[number];
  thumbnailUrl: string;
  layoutConfig: LayoutConfig;
  isActive: boolean;
}
export const Template = model<Data>(
  "Template",
  new Schema<Data>(
    {
      title: { type: String, required: true },
      occasionType: { type: String, enum: occasions, required: true },
      thumbnailUrl: { type: String, required: true },
      layoutConfig: { type: Schema.Types.Mixed, required: true },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
  ),
);
