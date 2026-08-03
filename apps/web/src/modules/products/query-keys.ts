import type { ProductFilters } from "./types/product.types";

export const productKeys = {
  all: ["products"] as const,

  list: (filters?: ProductFilters) => ["products", "list", filters] as const,

  detail: (id: string) => ["products", "detail", id] as const,
};
