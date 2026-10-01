import type { z } from "zod";
import type {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator.js";
import { User } from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
export const publicUser = (u: {
  _id: { toString(): string };
  name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
}) => ({
  id: u._id.toString(),
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
});
export async function register(input: z.infer<typeof registerSchema>) {
  const { password, ...fields } = input;
  const user = await User.create({
    ...fields,
    passwordHash: await hashPassword(password),
  });
  return { user: publicUser(user), token: signToken(user._id.toString()) };
}
export async function login(input: z.infer<typeof loginSchema>) {
  const user = await User.findOne(
    input.email ? { email: input.email } : { phone: input.phone },
  ).select("+passwordHash");
  if (!user || !(await comparePassword(input.password, user.passwordHash)))
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid credentials");
  return { user: publicUser(user), token: signToken(user._id.toString()) };
}
export async function me(id: string) {
  const user = await User.findById(id);
  if (!user) throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  return publicUser(user);
}
