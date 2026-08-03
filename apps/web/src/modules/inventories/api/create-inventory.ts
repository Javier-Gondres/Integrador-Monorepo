import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type {
  CreateInventoryValues,
  InventoryDto,
} from "../types/inventory.types";

export async function createInventory(data: CreateInventoryValues) {
  return apiFetch<InventoryDto>(ENDPOINTS.inventories.root, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
