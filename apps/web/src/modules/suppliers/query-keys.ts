import type { SupplierFilters } from "./types/supplier.types";

export const supplierKeys = {
  all: ["suppliers"] as const,
  list: (filters?: SupplierFilters) => ["suppliers", "list", filters] as const,
  detail: (id: string) => ["suppliers", "detail", id] as const,
};
