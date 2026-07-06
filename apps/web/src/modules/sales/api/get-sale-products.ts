import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { SaleProductsResponse } from "../types/sale.types";

export async function getSaleProducts(params: {
  branchId: string;
  search?: string;
  categoryId?: string;
}) {
  return apiFetch<SaleProductsResponse>(ENDPOINTS.sales.products, {
    params: {
      branchId: params.branchId,
      search: params.search,
      categoryId: params.categoryId,
    },
  });
}
