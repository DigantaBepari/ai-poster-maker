import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import mongoose from "mongoose";
try {
  await connectDb();
  const server = app.listen(env.PORT, () =>
    logger.info("API listening on port " + env.PORT),
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () => {
      server.close(() => {
        void mongoose.disconnect().then(() => process.exit(0));
      });
    });
} catch {
  logger.error("Server startup failed; check database configuration");
  process.exit(1);
}
