import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { InventoryDto } from "../types/inventory.types";

export async function activateInventory(id: string) {
  return apiFetch<InventoryDto>(ENDPOINTS.inventories.activate(id), {
    method: "PATCH",
  });
}

export async function deactivateInventory(id: string) {
  return apiFetch<InventoryDto>(ENDPOINTS.inventories.deactivate(id), {
    method: "PATCH",
  });
}
