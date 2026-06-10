import { apiFetch } from "@/lib/api/client";

export async function logout() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}
