import { AUTH_STORAGE_KEY } from "@/modules/auth/constants";

let memoryToken: string | null = null;

export function getAccessToken(): string | null {
  if (memoryToken) {
    return memoryToken;
  }

  if (typeof window === "undefined") {
    return null;
  }

  memoryToken = sessionStorage.getItem(AUTH_STORAGE_KEY);
  return memoryToken;
}

export function setAccessToken(token: string) {
  memoryToken = token;
  if (typeof window !== "undefined") {
    sessionStorage.setItem(AUTH_STORAGE_KEY, token);
  }
}

export function clearAccessToken() {
  memoryToken = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
