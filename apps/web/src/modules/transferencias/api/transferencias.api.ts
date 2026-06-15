import { apiFetch } from "@/lib/api/client";
import type { BaseListFilters } from "@/types/filters";
import type { PaginatedResponse } from "@/types/pagination";

import type { CrearTransferenciaPayload, TransferStatus } from "../types/transferencia.types";

export interface TransferenciasFilters extends BaseListFilters {
  status?: TransferStatus;
}

interface ApiTransfer {
  id: string;
  fromBranch: { name: string; address: string | null };
  toBranch: { name: string; address: string | null };
  status: TransferStatus;
  notes: string | null;
  createdAt: string;
  items: {
    id: string;
    quantity: number | string;
    product: { id: string; name: string; code: string };
  }[];
}

export async function getTransferencias(filters?: TransferenciasFilters) {
  return apiFetch<PaginatedResponse<ApiTransfer>>("/transfers", {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      status: filters?.status,
    },
  }).then((res) => ({
    ...res,
    items: res.items.map((t) => ({
      id: t.id,
      origenNombre: t.fromBranch.name,
      origenDireccion: t.fromBranch.address,
      destinoNombre: t.toBranch.name,
      destinoDireccion: t.toBranch.address,
      estado: t.status,
      notas: t.notes,
      creadaEn: t.createdAt,
      items: t.items.map((i: { id: string; quantity: number | string; product: { id: string; name: string; code: string } }) => ({
        id: i.id,
        cantidad: Number(i.quantity),
        productoId: i.product.id,
        productoNombre: i.product.name,
        productoSku: i.product.code,
      })),
    })),
  }));
}

export async function getStock(branchId: string, productId: string) {
  return apiFetch<{ quantity: number }>("/transfers/stock", {
    params: { branchId, productId },
  });
}

export async function crearTransferencia(payload: CrearTransferenciaPayload) {
  return apiFetch<unknown>("/transfers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function despacharTransferencia(id: string) {
  return apiFetch<unknown>(`/transfers/${id}/dispatch`, {
    method: "PATCH",
  });
}

export async function completarTransferencia(id: string) {
  return apiFetch<unknown>(`/transfers/${id}/complete`, {
    method: "PATCH",
  });
}

export async function cancelarTransferencia(id: string) {
  return apiFetch<unknown>(`/transfers/${id}/cancel`, {
    method: "PATCH",
  });
}
