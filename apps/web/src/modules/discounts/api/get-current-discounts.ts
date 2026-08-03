import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { DiscountDto } from "../types/discount.types";

export async function getCurrentDiscounts() {
  return apiFetch<DiscountDto[]>(ENDPOINTS.discounts.current);
}
