import { env } from "@/config/env";

import { ApiError } from "./errors";
import type { ApiErrorBody, ApiResponse } from "./types";

function getApiHeaders(includeJson = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  if (env.apiToken) {
    headers.Authorization = `Bearer ${env.apiToken}`;
  }

  return headers;
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${env.apiUrl}${endpoint}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { params?: Record<string, string | number | boolean | undefined> },
): Promise<T> {
  const { params, ...fetchOptions } = options ?? {};

  const response = await fetch(buildUrl(endpoint, params), {
    credentials: "include",
    headers: getApiHeaders(fetchOptions.body !== undefined),
    ...fetchOptions,
  });

  const json = (await response.json().catch(() => ({}))) as ApiResponse<T> | ApiErrorBody;

  if (!response.ok) {
    throw new ApiError(response.status, json as ApiErrorBody);
  }

  if (json && typeof json === "object" && "data" in json) {
    return (json as ApiResponse<T>).data;
  }

  return json as T;
}
