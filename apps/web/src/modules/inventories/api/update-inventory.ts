import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type {
  InventoryDto,
  UpdateInventoryValues,
} from "../types/inventory.types";

export async function updateInventory(id: string, data: UpdateInventoryValues) {
  return apiFetch<InventoryDto>(ENDPOINTS.inventories.byId(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
