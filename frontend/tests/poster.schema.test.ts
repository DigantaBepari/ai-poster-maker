import { it, expect } from "vitest";
import { posterFormSchema } from "../src/features/posters/poster.schema";
const valid = {
  name: "আব্দুল করিম",
  designation: "সভাপতি",
  party: "সংগঠন",
  union: "ওয়ার্ড",
  thana: "সদর",
  district: "ঢাকা",
  headline: "মহান বিজয় দিবস",
  photoConsent: true,
  uploadedPhotoUrls: [],
  paletteHint: "template",
};
it("requires consent and complete identity before submission", () => {
  expect(posterFormSchema.safeParse(valid).success).toBe(true);
  expect(
    posterFormSchema.safeParse({ ...valid, photoConsent: false }).success,
  ).toBe(false);
  expect(posterFormSchema.safeParse({ ...valid, name: "" }).success).toBe(
    false,
  );
});
it("preserves Bangla and caps photo count and headline length", () => {
  expect(posterFormSchema.parse(valid).headline).toBe(valid.headline);
  expect(
    posterFormSchema.safeParse({
      ...valid,
      uploadedPhotoUrls: Array(4).fill("https://example.com/photo.png"),
    }).success,
  ).toBe(false);
  expect(
    posterFormSchema.safeParse({ ...valid, headline: "ক".repeat(501) }).success,
  ).toBe(false);
});
