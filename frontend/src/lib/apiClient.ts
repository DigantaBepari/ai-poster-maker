import { TOKEN_KEY } from "./constants";
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base)
    throw new ApiError(
      503,
      "CONFIGURATION",
      "Set NEXT_PUBLIC_API_URL to connect to the API",
    );
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) headers.set("Authorization", "Bearer " + token);
  const response = await fetch(base.replace(/\/$/, "") + path, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({
        error: { code: "REQUEST_FAILED", message: "Request failed" },
      }));
    if (response.status === 401 && token && typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("auth:expired"));
    }
    throw new ApiError(
      response.status,
      body.error?.code ?? "REQUEST_FAILED",
      body.error?.message ?? "Request failed",
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
