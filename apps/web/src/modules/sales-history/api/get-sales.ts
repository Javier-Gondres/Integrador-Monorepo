import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/pagination";

import type {
  SaleHistoryFilters,
  SaleListDto,
} from "../types/sales-history.types";

/**
 * Convierte una fecha local (YYYY-MM-DD del <input type="date">) en el instante
 * ISO (UTC) correspondiente al inicio/fin de ese día en la zona horaria del
 * usuario. Así el filtro respeta el día tal como lo ve el usuario, sin importar
 * el offset respecto a UTC.
 */
function dayBoundaryIso(date: string, end: boolean): string | undefined {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  const d = end
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
  return d.toISOString();
}

export async function getSales(filters?: SaleHistoryFilters) {
  return apiFetch<PaginatedResponse<SaleListDto>>(ENDPOINTS.sales.root, {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      branchId: filters?.branchId,
      customerId: filters?.customerId,
      cashierId: filters?.cashierId,
      cashRegisterId: filters?.cashRegisterId,
      status: filters?.status,
      dateFrom: filters?.dateFrom
        ? dayBoundaryIso(filters.dateFrom, false)
        : undefined,
      dateTo: filters?.dateTo ? dayBoundaryIso(filters.dateTo, true) : undefined,
    },
  });
}
