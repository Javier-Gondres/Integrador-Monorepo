import { apiFetch } from "@/lib/api/client";

import type { DiscountDto } from "../types/discount.types";

export async function getDiscount(id: string) {
  return apiFetch<DiscountDto>(`/discounts/${id}`);
}