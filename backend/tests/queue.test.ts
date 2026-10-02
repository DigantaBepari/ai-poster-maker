import { it, expect, vi } from "vitest";
vi.mock("../src/config/env.js", () => ({ env: { GENERATION_CONCURRENCY: 1 } }));
import { PosterQueue } from "../src/services/poster/posterQueue.js";
it("bounds concurrent jobs and rejects new work during drain", async () => {
  const queue = new PosterQueue(2);
  let active = 0,
    peak = 0,
    finished = 0;
  for (let i = 0; i < 5; i++)
    queue.enqueue(async () => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((r) => setTimeout(r, 5));
      active--;
      finished++;
    });
  await queue.drain();
  expect(peak).toBe(2);
  expect(finished).toBe(5);
  expect(() => queue.enqueue(async () => {})).toThrow();
});
