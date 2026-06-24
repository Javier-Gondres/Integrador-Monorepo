import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/pagination";

import type { TransferDto, TransferFilters } from "../types/transferencia.types";

export async function getTransfers(filters?: TransferFilters) {
  return apiFetch<PaginatedResponse<TransferDto>>(ENDPOINTS.transfers.root, {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      status: filters?.status,
    },
  });
}
