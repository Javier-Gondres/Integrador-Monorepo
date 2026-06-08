import { apiFetch } from "@/lib/api/client";

import type { DiscountFormValuesDto } from "../types/discount.types";

export async function updateDiscount(id: string, data: DiscountFormValuesDto) {
  return apiFetch(`/discounts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
