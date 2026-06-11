import { apiFetch } from "@/lib/api/client";

import type {
  InventoryDto,
  UpdateInventoryValues,
} from "../types/inventory.types";

export async function updateInventory(id: string, data: UpdateInventoryValues) {
  return apiFetch<InventoryDto>(`/inventories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
