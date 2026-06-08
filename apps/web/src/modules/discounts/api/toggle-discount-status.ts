import { apiFetch } from "@/lib/api/client";

export async function toggleDiscountStatus(id: string, isActive: boolean) {
  return apiFetch(`/discounts/${id}/${isActive ? "deactivate" : "activate"}`, {
    method: "PATCH",
  });
}