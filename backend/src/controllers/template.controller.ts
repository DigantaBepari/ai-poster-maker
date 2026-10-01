import { asyncHandler } from "../utils/asyncHandler.js";
import * as s from "../services/template.service.js";
export const list = asyncHandler(async (req, res) => {
  res.json(await s.listTemplates(req.query));
});
export const get = asyncHandler(async (req, res) => {
  res.json(await s.getTemplate(String(req.params.id)));
});
export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await s.createTemplate(req.body));
});
export const update = asyncHandler(async (req, res) => {
  res.json(await s.updateTemplate(String(req.params.id), req.body));
});
export const remove = asyncHandler(async (req, res) => {
  res.json(await s.deleteTemplate(String(req.params.id)));
});
