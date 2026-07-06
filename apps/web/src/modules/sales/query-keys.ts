import type { SaleFilters } from "./types/sale.types";

export const saleKeys = {
  all: ["sales"] as const,
  list: (filters?: SaleFilters) => ["sales", "list", filters] as const,
  detail: (id: string) => ["sales", "detail", id] as const,
  allProducts: ["sales", "products"] as const,
  products: (
    branchId: string | null,
    search: string,
    categoryId: string | null,
  ) => ["sales", "products", branchId, search, categoryId] as const,
  currentShift: (branchId: string | null) =>
    ["sales", "current-shift", branchId] as const,
  creditNotes: (customerId: string | null) =>
    ["sales", "credit-notes", customerId] as const,
};
