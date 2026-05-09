import { clearAuthToken, getAuthToken } from "./cookies";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

type QueryParams = object;

function buildUrl(path: string, params?: QueryParams) {
  const url = new URL(path, API_BASE_URL);

  if (params) {
    Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
  params?: QueryParams
) {
  const headers = new Headers(options.headers);
  const token = getAuthToken();

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, params), {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.blob();

  if (response.status === 401) {
    clearAuthToken();
  }

  if (!response.ok) {
    const message =
      isJson && payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export async function downloadFile(
  path: string,
  filename: string,
  params?: QueryParams
) {
  const headers = new Headers();
  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, params), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new ApiError(`Download failed with status ${response.status}`, response.status);
  }

  const blob = await response.blob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
