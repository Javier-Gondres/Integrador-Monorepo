import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type {
  CreateWastePayload,
  PaginatedWasteResult,
  WasteFilters,
  WasteListItem,
} from "../types/waste.types";

export const WasteApi = {
  getPaginated: (filters: WasteFilters, signal?: AbortSignal) => {
    return apiFetch<PaginatedWasteResult>(ENDPOINTS.inventoryMovements.root, {
      params: { ...filters, type: "WASTE" },
      signal,
    });
  },

  create: (payload: CreateWastePayload) => {
    return apiFetch<WasteListItem>(ENDPOINTS.inventoryMovements.waste, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
