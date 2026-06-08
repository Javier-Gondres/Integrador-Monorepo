import type { DiscountFilters } from "./types/discount.types";

export const discountKeys = {
  all: ["discounts"] as const,

  list: (filters?: DiscountFilters) => ["discounts", "list", filters] as const,

  detail: (id: string) => ["discounts", "detail", id] as const,
};