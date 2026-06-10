import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function deleteProduct(id: string) {
  return apiFetch<void>(ENDPOINTS.products.byId(id), {
    method: "DELETE",
  });
}
