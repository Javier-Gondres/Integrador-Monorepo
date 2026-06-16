import { apiFetch } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/pagination";

import type {
  PurchaseFilters,
  PurchaseListDto,
} from "../types/purchase-history.types";

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

export async function getPurchases(filters?: PurchaseFilters) {
  return apiFetch<PaginatedResponse<PurchaseListDto>>("/purchases", {
    params: {
      page: filters?.page,
      take: filters?.take,
      branchId: filters?.branchId,
      supplierId: filters?.supplierId,
      dateFrom: filters?.dateFrom
        ? dayBoundaryIso(filters.dateFrom, false)
        : undefined,
      dateTo: filters?.dateTo ? dayBoundaryIso(filters.dateTo, true) : undefined,
    },
  });
}
