import type { z } from "zod";
import type { templateSchema } from "../validators/template.validator.js";
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
export function templateThumbnail(t: z.infer<typeof templateSchema>) {
  const l = t.layoutConfig,
    c = l.colorScheme,
    dark = t.occasionType === "condolence";
  const top = dark
    ? "স্মরণে ও শ্রদ্ধায়"
    : t.occasionType === "victory-day"
      ? "১৬ ডিসেম্বর"
      : "আপনার পাশে, আপনার সঙ্গে";
  const subtitle = dark ? "গভীর শোক ও সমবেদনা" : "মানুষের জন্য, দেশের জন্য";
  const message = dark ? "স্মৃতিতে থাকবেন চিরকাল" : "জয় হোক মানুষের";
  const slots = l.photoSlots
    .map(
      (s) =>
        '<ellipse cx="' +
        (s.x + s.w / 2) +
        '" cy="' +
        (s.y + s.h / 2) +
        '" rx="' +
        s.w / 2 +
        '" ry="' +
        s.h / 2 +
        '" fill="#f3f0e8" stroke="' +
        c.accent +
        '" stroke-width="5"/><g transform="translate(' +
        (s.x + s.w / 2) +
        " " +
        (s.y + s.h / 2) +
        ')"><circle cy="-23" r="28" fill="#c0c9c3"/><path d="M-48 50 Q-48 -2 0 -2 Q48 -2 48 50Z" fill="#c0c9c3"/></g>',
    )
    .join("");
  const motif = dark
    ? ""
    : '<g stroke="' +
      c.accent +
      '" stroke-width="4" fill="none"><path d="M60 760Q90 650 140 600M90 760Q110 660 170 620M740 760Q710 650 660 600M710 760Q690 660 630 620"/></g><g fill="' +
      c.accent +
      '"><ellipse cx="140" cy="600" rx="6" ry="14"/><ellipse cx="170" cy="620" rx="6" ry="14"/><ellipse cx="660" cy="600" rx="6" ry="14"/><ellipse cx="630" cy="620" rx="6" ry="14"/></g>';
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="' +
    c.primary +
    '"/><stop offset="1" stop-color="' +
    c.secondary +
    '"/></linearGradient></defs><rect width="800" height="1000" fill="url(#bg)"/><rect x="18" y="18" width="764" height="964" fill="none" stroke="' +
    c.accent +
    '" stroke-width="6"/>' +
    (!dark
      ? '<circle cx="400" cy="470" r="260" fill="#d6212a" opacity=".85"/><rect x="30" y="30" width="740" height="940" fill="none" stroke="' +
        c.accent +
        '" stroke-width="2"/>'
      : "") +
    '<g font-family="Noto Sans Bengali,Nirmala UI,sans-serif" text-anchor="middle"><text x="400" y="130" fill="' +
    c.accent +
    '" font-size="26">' +
    top +
    '</text><text x="400" y="225" fill="white" font-size="58" font-weight="700">' +
    escape(t.title) +
    '</text><text x="400" y="278" fill="white" font-size="25">' +
    subtitle +
    "</text>" +
    slots +
    motif +
    '<text x="400" y="775" font-size="30" fill="white">' +
    message +
    '</text><rect x="30" y="830" width="740" height="140" fill="' +
    c.footerBg +
    '"/><text x="400" y="885" font-size="40" font-weight="700" fill="white">আপনার নাম</text><text x="400" y="925" font-size="24" fill="white">পদবি · সংগঠন · আপনার এলাকা</text><text x="400" y="958" font-size="20" fill="' +
    c.accent +
    '">আপনার পরিচয়, আপনার ভাষায়</text></g></svg>'
  );
}
