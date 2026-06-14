import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { DiscountFormValuesDto } from "../types/discount.types";

export async function updateDiscount(id: string, data: DiscountFormValuesDto) {
  return apiFetch(ENDPOINTS.discounts.byId(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
