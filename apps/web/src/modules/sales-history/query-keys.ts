import type { SaleHistoryFilters } from "./types/sales-history.types";

export const saleHistoryKeys = {
  all: ["sales-history"] as const,
  list: (filters?: SaleHistoryFilters) =>
    ["sales-history", "list", filters] as const,
  detail: (id: string) => ["sales-history", "detail", id] as const,
};
