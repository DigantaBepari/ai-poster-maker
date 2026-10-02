import { Schema, model } from "mongoose";
export const GenerationLog = model(
  "GenerationLog",
  new Schema(
    {
      posterId: { type: Schema.Types.ObjectId, ref: "Poster", required: true },
      geminiPromptUsed: String,
      tokensUsed: Number,
      failedStage: String,
      failureCode: String,
      latencyMs: Number,
      success: { type: Boolean, required: true },
    },
    { timestamps: true },
  ),
);
