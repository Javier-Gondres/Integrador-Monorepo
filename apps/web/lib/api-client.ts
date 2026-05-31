const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function getApiHeaders(includeJson = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  const token = process.env.NEXT_PUBLIC_API_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export function unwrapApiData<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}

export { API_URL };
