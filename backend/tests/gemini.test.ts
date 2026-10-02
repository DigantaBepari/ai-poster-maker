import { it, expect, vi, afterEach } from "vitest";
vi.mock("../src/services/gemini/gemini.client.js", () => ({
  requestLayout: vi.fn(),
}));
import { requestLayout } from "../src/services/gemini/gemini.client.js";
import { suggestLayout } from "../src/services/gemini/layoutSuggestion.service.js";
import { defaultSuggestion } from "../src/services/gemini/defaults.js";
import { seedTemplates } from "../src/seed/templates.seed.js";
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});
it("falls back on invalid JSON and invalid schema", async () => {
  const t = seedTemplates[0];
  for (const [i, text] of ["not-json", '{"colorScheme":{}}'].entries()) {
    vi.mocked(requestLayout).mockResolvedValueOnce({ text, tokensUsed: 1 });
    const r = await suggestLayout(
      "invalid-" + i,
      t.occasionType,
      "template",
      t.layoutConfig,
    );
    expect(r.source).toBe("fallback");
    expect(r.suggestion.colorScheme).toEqual(t.layoutConfig.colorScheme);
  }
});
it("falls back after 15 seconds rather than blocking rendering", async () => {
  vi.useFakeTimers();
  vi.mocked(requestLayout).mockImplementationOnce(() => new Promise(() => {}));
  const t = seedTemplates[0];
  const result = suggestLayout(
    "timeout",
    t.occasionType,
    "template",
    t.layoutConfig,
  );
  await vi.advanceTimersByTimeAsync(15001);
  expect((await result).source).toBe("fallback");
});
it("caches validated suggestions by template, occasion and palette", async () => {
  const t = seedTemplates[0];
  vi.mocked(requestLayout).mockResolvedValue({
    text: JSON.stringify(defaultSuggestion(t.layoutConfig, t.occasionType)),
    tokensUsed: 18,
  });
  const first = await suggestLayout(
    "cached",
    t.occasionType,
    "template",
    t.layoutConfig,
  );
  const second = await suggestLayout(
    "cached",
    t.occasionType,
    "template",
    t.layoutConfig,
  );
  expect(first.tokensUsed).toBe(18);
  expect(second.source).toBe("cache");
  expect(second.tokensUsed).toBe(0);
  expect(requestLayout).toHaveBeenCalledTimes(1);
});
