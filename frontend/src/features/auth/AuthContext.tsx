"use client";
import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@/types/models";
import type { AuthResponse } from "@/types/api";
import { TOKEN_KEY } from "@/lib/constants";
import { getMe } from "./auth.api";
export const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  authenticate: (r: AuthResponse) => void;
  logout: () => void;
} | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);
  useEffect(() => {
    let active = true;
    window.addEventListener("auth:expired", logout);
    async function restoreSession() {
      try {
        const restored = localStorage.getItem(TOKEN_KEY)
          ? await getMe()
          : await Promise.resolve(null);
        if (active) setUser(restored);
      } catch {
        if (active) logout();
      } finally {
        if (active) setLoading(false);
      }
    }
    void restoreSession();
    return () => {
      active = false;
      window.removeEventListener("auth:expired", logout);
    };
  }, [logout]);
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        authenticate: (r) => {
          localStorage.setItem(TOKEN_KEY, r.token);
          setUser(r.user);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
