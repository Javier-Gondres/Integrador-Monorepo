import { apiFetch } from "@/lib/api/client";

import type {
  CreateInventoryValues,
  InventoryDto,
} from "../types/inventory.types";

export async function createInventory(data: CreateInventoryValues) {
  return apiFetch<InventoryDto>("/inventories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
