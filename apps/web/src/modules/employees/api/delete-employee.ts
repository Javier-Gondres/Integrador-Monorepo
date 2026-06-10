import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function deleteEmployee(id: string) {
  return apiFetch<{ message: string }>(ENDPOINTS.employees.byId(id), {
    method: "DELETE",
  });
}
