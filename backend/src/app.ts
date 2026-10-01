import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.js";
import { routes } from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
export const app = express();
app.use(
  helmet(),
  cors({ origin: env.CLIENT_URL }),
  express.json({ limit: "100kb" }),
);
app.use("/api", routes);
app.use(notFound, errorHandler);
