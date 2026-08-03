import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { InventoryAlert } from "../types/recurring-waste-alerts";

export async function getRecurringWasteAlerts(): Promise<InventoryAlert[]> {
  return apiFetch<InventoryAlert[]>(ENDPOINTS.inventoryMovements.wasteAlerts);
}
