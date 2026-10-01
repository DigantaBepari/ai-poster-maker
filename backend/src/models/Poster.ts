import { Schema, model } from "mongoose";
import { occasions } from "../config/constants.js";
const field = { type: String, required: true };
const form = new Schema(
  {
    name: field,
    designation: field,
    party: field,
    union: field,
    thana: field,
    district: field,
    occasionType: { type: String, enum: occasions, required: true },
    headline: field,
  },
  { _id: false },
);
export const Poster = model(
  "Poster",
  new Schema(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      templateId: {
        type: Schema.Types.ObjectId,
        ref: "Template",
        required: true,
      },
      formData: { type: form, required: true },
      uploadedPhotoUrls: {
        type: [String],
        validate: (v: string[]) => v.length <= 3,
      },
      generatedImageUrl: String,
      generatedPdfUrl: String,
      status: {
        type: String,
        enum: ["draft", "generating", "completed", "failed"],
        default: "draft",
      },
      retryCount: { type: Number, default: 0 },
      flagged: { type: Boolean, default: false },
      errorMessage: String,
    },
    { timestamps: true },
  ),
);
