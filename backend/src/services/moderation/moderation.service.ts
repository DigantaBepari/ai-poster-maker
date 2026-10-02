import { blocklist } from "../../config/blocklist.js";
import { ApiError } from "../../utils/ApiError.js";
const normalize = (s: string) =>
  s
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[​-‍﻿]/g, "")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim();
export function moderateText(values: Record<string, unknown>) {
  for (const value of Object.values(values)) {
    if (typeof value !== "string") continue;
    const text = normalize(value);
    if (
      blocklist.some(
        (term) => normalize(term).length > 0 && text.includes(normalize(term)),
      )
    )
      throw new ApiError(
        422,
        "CONTENT_BLOCKED",
        "এই লেখায় নিষিদ্ধ বা আপত্তিকর শব্দ রয়েছে। অনুগ্রহ করে সংশোধন করুন।",
      );
  }
}
