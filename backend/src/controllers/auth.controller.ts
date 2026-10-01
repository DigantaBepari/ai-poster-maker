import { asyncHandler } from "../utils/asyncHandler.js";
import * as s from "../services/auth.service.js";
export const register = asyncHandler(async (req, res) => {
  res.status(201).json(await s.register(req.body));
});
export const login = asyncHandler(async (req, res) => {
  res.json(await s.login(req.body));
});
export const me = asyncHandler(async (req, res) => {
  res.json(await s.me(req.user!.id));
});
