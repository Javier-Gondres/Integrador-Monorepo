import type { SupplierProductFilters } from "./types/supplier-product.types";

export const supplierCatalogKeys = {
  all: ["supplier-catalog"] as const,
  products: (supplierId: string, filters?: SupplierProductFilters) =>
    ["supplier-catalog", supplierId, "products", filters] as const,
};
