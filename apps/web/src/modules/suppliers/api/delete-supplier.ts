import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function deleteSupplier(id: string) {
  return apiFetch<{ message: string }>(ENDPOINTS.suppliers.byId(id), {
    method: "DELETE",
  });
}
