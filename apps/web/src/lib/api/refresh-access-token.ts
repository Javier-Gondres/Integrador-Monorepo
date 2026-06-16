import { env } from "@/config/env";

import { tokenStorage } from "./access-token";
import { ENDPOINTS } from "./endpoints";
import { ApiError } from "./errors";
import type { ApiErrorBody, ApiResponse } from "./types";

type RefreshTokenResponse = { accessToken: string };

let refreshPromise: Promise<string> | null = null;

async function requestNewAccessToken(): Promise<string> {
  const response = await fetch(`${env.apiUrl}${ENDPOINTS.auth.refresh}`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  const json = (await response.json().catch(() => ({}))) as
    | ApiResponse<RefreshTokenResponse>
    | ApiErrorBody
    | RefreshTokenResponse;

  if (!response.ok) {
    tokenStorage.clear();
    throw new ApiError(response.status, json as ApiErrorBody);
  }

  const data =
    json && typeof json === "object" && "data" in json
      ? (json as ApiResponse<RefreshTokenResponse>).data
      : (json as RefreshTokenResponse);

  tokenStorage.set(data.accessToken);
  return data.accessToken;
}

/** Renueva el access token usando la cookie de refresh (una sola petición concurrente). */
export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
