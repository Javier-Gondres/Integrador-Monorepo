import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function deleteCustomer(id: string) {
  return apiFetch<void>(ENDPOINTS.customers.byId(id), {
    method: "DELETE",
  });
}
