import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function toggleDiscountStatus(id: string, isActive: boolean) {
  return apiFetch(
    isActive
      ? ENDPOINTS.discounts.deactivate(id)
      : ENDPOINTS.discounts.activate(id),
    {
      method: "PATCH",
    },
  );
}
