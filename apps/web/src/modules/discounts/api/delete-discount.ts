import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function deleteDiscount(id: string) {
  return apiFetch(ENDPOINTS.discounts.byId(id), {
    method: "DELETE",
  });
}
