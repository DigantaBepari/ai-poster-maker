import { it, expect } from "vitest";
import { buildPosterHtml } from "../src/services/render/html/buildPosterHtml.js";
import { defaultSuggestion } from "../src/services/gemini/defaults.js";
import { seedTemplates } from "../src/seed/templates.seed.js";
import { formData } from "./setup.js";
it("keeps exact Bangla text, escapes HTML, embeds fonts and allows no remote images", async () => {
  const t = seedTemplates[0];
  const data = {
    ...formData,
    occasionType: "victory-day" as const,
    photoConsent: true as const,
    headline: "মহান বিজয় দিবস — শুভেচ্ছা",
    name: "মোহাম্মদ আব্দুল করিম চৌধুরী",
    party: "<script>alert(1)</script>",
  };
  const html = await buildPosterHtml(
    t.layoutConfig,
    data,
    defaultSuggestion(t.layoutConfig, t.occasionType),
    ["https://evil.example/photo.png"],
  );
  expect(html).toContain(data.headline);
  expect(html).toContain(data.name);
  expect(html).toContain("&lt;script&gt;");
  expect(html).not.toContain("<script>");
  expect(html).not.toContain("evil.example");
  expect(html).toContain("data:font/woff2;base64,");
  expect(html).toContain('data-fit="true"');
});
