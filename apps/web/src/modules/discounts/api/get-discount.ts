import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { DiscountDto } from "../types/discount.types";

export async function getDiscount(id: string) {
  return apiFetch<DiscountDto>(ENDPOINTS.discounts.byId(id));
}
