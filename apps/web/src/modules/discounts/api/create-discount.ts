import { apiFetch } from "@/lib/api/client";

import type { DiscountFormValuesDto } from "../types/discount.types";

export async function createDiscount(data: DiscountFormValuesDto) {
  return apiFetch("/discounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
