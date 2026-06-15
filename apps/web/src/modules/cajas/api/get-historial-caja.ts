import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/pagination";

import type { TurnoHistorial } from "../types/caja.types";

export interface ShiftFilters {
  page?: number;
  take?: number;
}

export async function getHistorialCaja(cajaId: string, filters?: ShiftFilters) {
  return apiFetch<PaginatedResponse<TurnoHistorial>>(
    ENDPOINTS.cashRegisters.shifts(cajaId),
    {
      params: {
        page: filters?.page,
        take: filters?.take,
      },
    },
  );
}
