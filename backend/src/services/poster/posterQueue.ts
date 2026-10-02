import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { logger } from "../../utils/logger.js";
export class PosterQueue {
  private jobs: Array<() => Promise<void>> = [];
  private active = 0;
  private accepting = true;
  constructor(
    private concurrency = 1,
    private capacity = 50,
  ) {}
  assertAvailable() {
    if (!this.accepting || this.jobs.length + this.active >= this.capacity)
      throw new ApiError(
        503,
        "QUEUE_FULL",
        "পোস্টার তৈরির সারি পূর্ণ। কিছুক্ষণ পর চেষ্টা করুন।",
      );
  }
  enqueue(job: () => Promise<void>) {
    this.assertAvailable();
    this.jobs.push(job);
    this.pump();
  }
  private pump() {
    while (this.active < this.concurrency && this.jobs.length) {
      const job = this.jobs.shift()!;
      this.active++;
      void Promise.resolve()
        .then(job)
        .catch(() => logger.error("Poster job failed"))
        .finally(() => {
          this.active--;
          this.pump();
        });
    }
  }
  async drain() {
    this.accepting = false;
    while (this.active || this.jobs.length)
      await new Promise((r) => setTimeout(r, 100));
  }
}
export const posterQueue = new PosterQueue(env.GENERATION_CONCURRENCY);
