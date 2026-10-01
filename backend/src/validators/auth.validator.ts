import { z } from "zod";
const identity = {
  email: z.email().trim().toLowerCase().optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/)
    .optional(),
};
export const registerSchema = z
  .object({
    ...identity,
    name: z.string().trim().min(2).max(100),
    password: z
      .string()
      .min(8)
      .max(72)
      .refine(
        (v) => Buffer.byteLength(v) <= 72,
        "Password exceeds bcrypt byte limit",
      ),
  })
  .strict()
  .refine((v) => v.email || v.phone, { message: "Email or phone required" });
export const loginSchema = z
  .object({ ...identity, password: z.string().min(1).max(72) })
  .strict()
  .refine((v) => Boolean(v.email) !== Boolean(v.phone), {
    message: "Provide exactly one email or phone",
  });
