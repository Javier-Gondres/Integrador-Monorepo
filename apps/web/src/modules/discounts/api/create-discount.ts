import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { DiscountFormValuesDto } from "../types/discount.types";

export async function createDiscount(data: DiscountFormValuesDto) {
  return apiFetch(ENDPOINTS.discounts.root, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
