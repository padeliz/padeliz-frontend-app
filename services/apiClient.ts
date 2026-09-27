/**
 * Typed fetch client for the Laravel API.
 *
 * - Prefixes every path with API_URL and always sends `Accept: application/json`.
 * - Injects `Authorization: Bearer <token>` for authed calls (token supplied by a
 *   getter the AuthProvider registers via `setTokenGetter`, so this module stays
 *   decoupled from React / the auth context — no circular imports).
 * - Handles BOTH response envelopes: custom `{success,message,data}` and Laravel
 *   pagination `{data,links,meta}`.
 * - Throws `ApiError` on any non-2xx (no auto token refresh — Sanctum tokens are
 *   opaque and don't rotate; a 401 is surfaced so the AuthProvider can sign out).
 */
import { API_URL } from "@/utils/constants";
import { ApiError } from "@/services/apiError";
import type { PaginatedResponse } from "@/types/api";

type TokenGetter = () => string | null;

let tokenGetter: TokenGetter = () => null;

/** Registered by the AuthProvider so the client can read the current bearer token. */
export function setTokenGetter(fn: TokenGetter): void {
  tokenGetter = fn;
}

let unauthorizedHandler: (() => void) | null = null;

/**
 * Registered by the AuthProvider. Invoked once whenever any authed request gets a
 * 401, so a stale/invalid token triggers a global sign-out. Not called for calls
 * made with `auth: false`.
 */
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorizedHandler = fn;
}

type QueryValue = string | number | boolean | undefined | null;

export interface RequestOpts {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, QueryValue>;
  /** JSON body — serialized and sent with Content-Type: application/json. */
  body?: unknown;
  /** Multipart body — sent as-is; Content-Type is left to the runtime. */
  formData?: FormData;
  /** Whether to attach the bearer token. Defaults to true. */
  auth?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined;
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text; // non-JSON body (shouldn't happen with Accept: application/json)
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Core request. Returns the parsed JSON body (raw, un-unwrapped). */
export async function request<T = unknown>(
  path: string,
  opts: RequestOpts = {}
): Promise<T> {
  const { method = "GET", query, body, formData, auth = true, signal } = opts;

  const headers: Record<string, string> = { Accept: "application/json" };

  if (auth) {
    const token = tokenGetter();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const authed = auth;

  let requestBody: BodyInit | undefined;
  if (formData) {
    requestBody = formData; // do NOT set Content-Type — runtime adds the boundary
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: requestBody,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(0, "Network request failed", { body: err });
  }

  const parsed = await parseBody(res);

  if (!res.ok) {
    let message = res.statusText || `Request failed (${res.status})`;
    let validationErrors: Record<string, string[]> | undefined;
    if (isRecord(parsed)) {
      if (typeof parsed.message === "string") message = parsed.message;
      if (res.status === 422 && isRecord(parsed.errors)) {
        validationErrors = parsed.errors as Record<string, string[]>;
      }
    }
    // A 401 on an authed call means the token is stale/invalid → global sign-out.
    if (res.status === 401 && authed) unauthorizedHandler?.();
    throw new ApiError(res.status, message, { validationErrors, body: parsed });
  }

  return parsed as T;
}

/** Unwrap a custom `{success,message,data}` envelope; pass through anything else. */
function unwrap<T>(raw: unknown): T {
  if (isRecord(raw) && "success" in raw && "data" in raw) {
    return raw.data as T;
  }
  return raw as T;
}

// ---------- Envelope-aware helpers ----------

/** GET returning a custom envelope; resolves to `data`. */
export async function apiGetEnvelope<T>(
  path: string,
  opts?: RequestOpts
): Promise<T> {
  return unwrap<T>(await request(path, { ...opts, method: "GET" }));
}

/** GET returning a Laravel paginated list; resolves to the whole `{data,links,meta}`. */
export async function apiGetPaginated<T>(
  path: string,
  opts?: RequestOpts
): Promise<PaginatedResponse<T>> {
  return (await request(path, {
    ...opts,
    method: "GET",
  })) as PaginatedResponse<T>;
}

/** POST a JSON body; unwraps the custom envelope to `data`. */
export async function apiPost<T>(
  path: string,
  body?: unknown,
  opts?: RequestOpts
): Promise<T> {
  return unwrap<T>(await request(path, { ...opts, method: "POST", body }));
}

/** PATCH a JSON body; unwraps the custom envelope to `data`. */
export async function apiPatch<T>(
  path: string,
  body?: unknown,
  opts?: RequestOpts
): Promise<T> {
  return unwrap<T>(await request(path, { ...opts, method: "PATCH", body }));
}

/** DELETE; unwraps the custom envelope (often `null`). */
export async function apiDelete<T>(
  path: string,
  opts?: RequestOpts
): Promise<T> {
  return unwrap<T>(await request(path, { ...opts, method: "DELETE" }));
}

/** POST multipart/form-data; unwraps the custom envelope to `data`. */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
  opts?: RequestOpts
): Promise<T> {
  return unwrap<T>(await request(path, { ...opts, method: "POST", formData }));
}
