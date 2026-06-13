import { apiFetch } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/pagination";
import type {
  AbrirTurnoPayload,
  Caja,
  CerrarTurnoPayload,
  TurnoHistorial,
} from "../types/caja.types";

export async function getCajas(branchId?: string) {
  const url = branchId
    ? `/cash-registers?branchId=${branchId}`
    : "/cash-registers";
  return apiFetch<Caja[]>(url);
}

export async function createCaja(payload: { name: string; branchId?: string }) {
  return apiFetch<Caja>("/cash-registers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function openShift(
  cajaId: string,
  payload: Omit<AbrirTurnoPayload, "cajaId">,
) {
  return apiFetch<{ message: string }>(`/cash-registers/${cajaId}/open-shift`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function closeShift(
  cajaId: string,
  shiftId: string,
  payload: Pick<CerrarTurnoPayload, "montoCierre">,
) {
  return apiFetch<{ message: string }>(
    `/cash-registers/${cajaId}/close-shift/${shiftId}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export interface ShiftFilters {
  page?: number;
  take?: number;
}

export async function getHistorialCaja(cajaId: string, filters?: ShiftFilters) {
  return apiFetch<PaginatedResponse<TurnoHistorial>>(
    `/cash-registers/${cajaId}/shifts`,
    {
      params: {
        page: filters?.page,
        take: filters?.take,
      },
    },
  );
}
