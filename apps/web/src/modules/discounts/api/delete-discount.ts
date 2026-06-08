import { apiFetch } from "@/lib/api/client";

export async function deleteDiscount(id: string) {
  return apiFetch(`/discounts/${id}`, {
    method: "DELETE",
  });
}
