import { Schema, model } from "mongoose";
const schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);
schema.index({ email: 1 }, { unique: true, sparse: true });
schema.index({ phone: 1 }, { unique: true, sparse: true });
schema.pre("validate", function () {
  if (!this.email && !this.phone)
    this.invalidate("email", "Email or phone required");
});
export const User = model("User", schema);
