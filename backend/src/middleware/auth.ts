import type { RequestHandler } from "express";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
export const auth: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new Error();
    const p = verifyToken(header.slice(7));
    if (typeof p === "string" || !p.sub) throw new Error();
    const user = await User.findById(p.sub);
    if (!user) throw new Error();
    req.user = { id: user._id.toString(), role: user.role as "user" | "admin" };
    next();
  } catch {
    next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
  }
};
