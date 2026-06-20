import type { PaginatedResponse } from "@/types/pagination";

import type {
  Adjustment,
  AdjustmentDto,
} from "../types/inventory-adjustment.types";

export function mapAdjustmentDtoToUi(dto: AdjustmentDto): Adjustment {
  return {
    id: dto.id,
    productName: dto.product.name,
    quantity: Number(dto.quantity),
    adjustmentReason: dto.adjustmentReason,
    notes: dto.notes,
    createdAt: dto.createdAt,
  };
}

export function mapAdjustmentsPageToUi(
  response: PaginatedResponse<AdjustmentDto>,
): PaginatedResponse<Adjustment> {
  return {
    items: response.items.map(mapAdjustmentDtoToUi),
    meta: response.meta,
  };
}
