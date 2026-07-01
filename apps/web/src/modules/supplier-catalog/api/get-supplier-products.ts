import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/pagination";

import type {
  SupplierProductDto,
  SupplierProductFilters,
} from "../types/supplier-product.types";

export async function getSupplierProducts(
  supplierId: string,
  filters?: SupplierProductFilters,
) {
  return apiFetch<PaginatedResponse<SupplierProductDto>>(
    ENDPOINTS.suppliers.products.root(supplierId),
    {
      params: {
        page: filters?.page,
        take: filters?.take,
        search: filters?.search,
        isActive: filters?.isActive,
      },
    },
  );
}
