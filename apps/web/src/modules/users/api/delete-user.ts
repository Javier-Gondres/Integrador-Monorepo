import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function deleteUser(id: string) {
  return apiFetch<{ message: string }>(ENDPOINTS.users.byId(id), {
    method: "DELETE",
  });
}
