import { apiFetch } from "@/lib/api/client";

import type { DiscountDto } from "../types/discount.types";

export async function getCurrentDiscounts() {
  return apiFetch<DiscountDto[]>("/discounts/vigentes");
}