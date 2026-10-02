import { mkdir, writeFile } from "node:fs/promises";
import { seedTemplates } from "../seed/templates.seed.js";
import { defaultSuggestion } from "../services/gemini/defaults.js";
import { buildPosterHtml } from "../services/render/html/buildPosterHtml.js";
import {
  renderPoster,
  closeRenderer,
} from "../services/render/renderer.service.js";
const folder = new URL("../../output/", import.meta.url);
try {
  await mkdir(folder, { recursive: true });
  for (const template of seedTemplates) {
    const data = {
      name: "মোহাম্মদ আব্দুল করিম চৌধুরী",
      designation: "সভাপতি, ৫ নং ওয়ার্ড শাখা",
      party: "স্থানীয় নাগরিক সংগঠন",
      union: "শ্যামপুর ইউনিয়ন",
      thana: "সদর উপজেলা",
      district: "ঢাকা",
      occasionType: template.occasionType,
      headline: template.title,
      photoConsent: true as const,
    };
    const html = await buildPosterHtml(
      template.layoutConfig,
      data,
      defaultSuggestion(template.layoutConfig, template.occasionType),
      [],
    );
    const output = await renderPoster(html);
    await writeFile(
      new URL(template.occasionType + ".png", folder),
      output.png,
    );
    await writeFile(
      new URL(template.occasionType + ".pdf", folder),
      output.pdf,
    );
    console.info(
      "Rendered " + template.occasionType + " (2400×3200 PNG + PDF)",
    );
  }
} finally {
  await closeRenderer();
}
