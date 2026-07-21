import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export function removeUserMembership(userId: string) {
  return apiFetch<{ message: string }>(
    ENDPOINTS.users.removeMembership(userId),
    {
      method: "DELETE",
    },
  );
}
