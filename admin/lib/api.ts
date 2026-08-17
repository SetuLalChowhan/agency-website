const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const TOKEN_KEY = "kern_admin_jwt";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code = "error", details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  formData?: FormData;
  /** Throw the parsed ApiError on non-2xx. Defaults to true. */
  throwOnError?: boolean;
};

export async function api<T = unknown>(
  path: string,
  { method = "GET", body, formData, throwOnError = true }: Options = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";

  const token = getAuthToken();
  if (token) {
    headers["authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    credentials: "include",
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  let json: {
    success?: boolean;
    data?: unknown;
    meta?: unknown;
    error?: { code?: string; message?: string; details?: unknown };
  } | null = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok || !json?.success) {
    const err = new ApiError(
      res.status,
      json?.error?.message ?? `Request failed (${res.status})`,
      json?.error?.code ?? "error",
      json?.error?.details
    );
    if (throwOnError) throw err;
    return json as T;
  }

  // Return the full envelope ({ success, data, meta }) — callers read res.data / res.meta.
  return json as T;
}

export const API_URL = API;
