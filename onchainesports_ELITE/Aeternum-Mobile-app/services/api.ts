import AsyncStorage from "@react-native-async-storage/async-storage";

export const BACKEND_BASE_URL = "https://hackjlu.vercel.app";
export const BACKEND_TOKEN_KEY = "aeturnum_backend_token";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: JsonValue | FormData;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  logHttpFailure?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
    requiresAuth = true,
    logHttpFailure = true,
  } = options;
  const url = `${BACKEND_BASE_URL}${path}`;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (requiresAuth) {
    const token = await AsyncStorage.getItem(BACKEND_TOKEN_KEY);
    if (!token) {
      throw new Error("Authentication token is missing. Please sign in again.");
    }
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  if (body && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch (error) {
    console.error("[API] Network failure", {
      method,
      path,
      url,
      requiresAuth,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new ApiError(
      `Network request failed (${method} ${path}). Check internet/backend availability.`,
      0,
      { originalError: error instanceof Error ? error.message : String(error) },
    );
  }

  const raw = await response.text();
  const parsed = raw ? safeParseJson(raw) : null;

  if (!response.ok) {
    const messageFromBody =
      typeof parsed === "object" && parsed && "message" in parsed
        ? String((parsed as { message?: unknown }).message ?? "")
        : "";

    if (logHttpFailure) {
      console.error("[API] HTTP failure", {
        method,
        path,
        url,
        status: response.status,
        response: parsed,
      });
    }

    throw new ApiError(
      messageFromBody || `Request failed with status ${response.status}`,
      response.status,
      parsed,
    );
  }

  return parsed as T;
}

function safeParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
