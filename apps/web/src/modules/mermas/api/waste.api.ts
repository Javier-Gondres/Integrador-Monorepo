import { apiFetch } from "@/lib/api/client";

import type {
  CreateWastePayload,
  PaginatedWasteResult,
  WasteFilters,
  WasteListItem,
} from "../types/waste.types";

export const WasteApi = {
  getPaginated: (filters: WasteFilters, signal?: AbortSignal) => {
    return apiFetch<PaginatedWasteResult>("/inventory-movements", {
      params: { ...filters, type: "WASTE" },
      signal,
    });
  },

  create: (payload: CreateWastePayload) => {
    return apiFetch<WasteListItem>("/inventory-movements/waste", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
