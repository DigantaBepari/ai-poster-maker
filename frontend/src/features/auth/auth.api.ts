import { apiClient } from "@/lib/apiClient";
import type { AuthResponse } from "@/types/api";
import type { User } from "@/types/models";
export interface Credentials {
  email?: string;
  phone?: string;
  password: string;
}
export const login = (body: Credentials) =>
  apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
export const register = (body: Credentials & { name: string }) =>
  apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
export const getMe = () => apiClient<User>("/auth/me");
