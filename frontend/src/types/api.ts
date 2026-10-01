import type { User } from "./models";
export interface AuthResponse {
  user: User;
  token: string;
}
export interface ApiErrorResponse {
  error: { code: string; message: string; details?: unknown };
}
