import { asyncHandler } from "../utils/asyncHandler.js";
import * as s from "../services/poster.service.js";
import { downloadPoster } from "../services/poster/download.service.js";
export const create = asyncHandler(async (req, res) => {
  res.status(202).json(await s.createPoster(req.body, req.user!));
});
export const get = asyncHandler(async (req, res) => {
  res.json(await s.readPoster(String(req.params.id), req.user!));
});
export const list = asyncHandler(async (req, res) => {
  res.json(await s.listPosters(String(req.params.userId), req.user!));
});
export const remove = asyncHandler(async (req, res) => {
  await s.deletePoster(String(req.params.id), req.user!);
  res.status(204).end();
});
export const regenerate = asyncHandler(async (req, res) => {
  res
    .status(202)
    .json(await s.regeneratePoster(String(req.params.id), req.user!, req.body));
});
export const adminList = asyncHandler(async (req, res) => {
  res.json(await s.adminPosters(req.query));
});
export const flag = asyncHandler(async (req, res) => {
  res.json(await s.flagPoster(String(req.params.id), req.body.flagged));
});
export const download = asyncHandler(async (req, res) => {
  const file = await downloadPoster(
    String(req.params.id),
    req.user!,
    req.query,
  );
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="' + file.filename + '"',
  );
  res.type(file.mime).send(file.buffer);
});
