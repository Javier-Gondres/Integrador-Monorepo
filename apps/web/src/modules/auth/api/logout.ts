import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function logout() {
  return apiFetch<void>(ENDPOINTS.auth.logout, { method: "POST" });
}
