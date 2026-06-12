import { apiFetch } from "@/lib/api/client";

import type { InventoryDto } from "../types/inventory.types";

export async function activateInventory(id: string) {
  return apiFetch<InventoryDto>(`/inventories/${id}/activate`, {
    method: "PATCH",
  });
}

export async function deactivateInventory(id: string) {
  return apiFetch<InventoryDto>(`/inventories/${id}/deactivate`, {
    method: "PATCH",
  });
}
