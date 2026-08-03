import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export function transferOwnership(newOwnerUserId: string) {
  return apiFetch<{ message: string }>(ENDPOINTS.users.transferOwnership, {
    method: "POST",
    body: JSON.stringify({ newOwnerUserId }),
  });
}
