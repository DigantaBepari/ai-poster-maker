import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import mongoose from "mongoose";
import { recoverInterruptedJobs } from "./services/poster/posterGeneration.service.js";
import { posterQueue } from "./services/poster/posterQueue.js";
import { closeRenderer } from "./services/render/renderer.service.js";
try {
  await connectDb();
  await recoverInterruptedJobs();
  const server = app.listen(env.PORT, () =>
    logger.info("API listening on port " + env.PORT),
  );
  let stopping = false;
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () => {
      if (stopping) return;
      stopping = true;
      server.close();
      void (async () => {
        await posterQueue.drain();
        await closeRenderer();
        await mongoose.disconnect();
        process.exit(0);
      })();
    });
} catch {
  logger.error("Server startup failed; check database configuration");
  process.exit(1);
}
