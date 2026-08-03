import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type {
  AdjustmentDto,
  CreateAdjustmentValues,
} from "../types/inventory-adjustment.types";

export async function createAdjustment(data: CreateAdjustmentValues) {
  return apiFetch<AdjustmentDto>(ENDPOINTS.inventoryMovements.adjustments, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
