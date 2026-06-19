import { apiFetch } from "@/lib/api/client";

import type {
  AdjustmentDto,
  CreateAdjustmentValues,
} from "../types/inventory-adjustment.types";

export async function createAdjustment(data: CreateAdjustmentValues) {
  return apiFetch<AdjustmentDto>("/inventory-movements/adjustments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
