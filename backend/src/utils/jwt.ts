import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
export const signToken = (id: string) =>
  jwt.sign({}, env.JWT_SECRET, {
    subject: id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    algorithm: "HS256",
  });
export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
