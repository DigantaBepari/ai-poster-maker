import { asyncHandler } from "../utils/asyncHandler.js";
import * as s from "../services/poster.service.js";
import { z } from "zod";
export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await s.createPoster(req.body, req.user!));
});
export const get = asyncHandler(async (req, res) => {
  res.json(await s.getPoster(String(req.params.id), req.user!));
});
export const list = asyncHandler(async (req, res) => {
  res.json(await s.listPosters(String(req.params.userId), req.user!));
});
export const remove = asyncHandler(async (req, res) => {
  await s.deletePoster(String(req.params.id), req.user!);
  res.status(204).end();
});
export const regenerate = asyncHandler(async (req, res) => {
  res.json(await s.regeneratePoster(String(req.params.id), req.user!));
});
export const adminList = asyncHandler(async (req, res) => {
  const q = z
    .object({ flagged: z.enum(["true", "false"]).optional() })
    .parse(req.query);
  res.json(
    await s.adminPosters(
      q.flagged === undefined ? undefined : q.flagged === "true",
    ),
  );
});
export const flag = asyncHandler(async (req, res) => {
  res.json(await s.flagPoster(String(req.params.id), req.body.flagged));
});
