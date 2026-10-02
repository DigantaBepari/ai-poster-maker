import { it, expect } from "vitest";
import { moderateText } from "../src/services/moderation/moderation.service.js";
it("blocks Bangla and English abusive phrases with case and whitespace variations", () => {
  for (const headline of [
    "সব হিন্দুকে হত্যা",
    "KILL   ALL",
    "জাতিগত নির্মূল",
    "motherfucker",
  ])
    expect(() => moderateText({ headline })).toThrow();
});
it("allows ordinary greetings, names and neutral political affiliation", () => {
  expect(() =>
    moderateText({
      headline: "বিজয়ের শুভেচ্ছা",
      name: "আব্দুল করিম",
      designation: "সভাপতি",
    }),
  ).not.toThrow();
});
