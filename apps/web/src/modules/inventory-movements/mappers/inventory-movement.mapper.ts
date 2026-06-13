import type { PaginatedResponse } from "@/types/pagination";

import type {
  InventoryMovement,
  InventoryMovementDto,
} from "../types/inventory-movement.types";

export function mapInventoryMovementDtoToUi(
  dto: InventoryMovementDto,
): InventoryMovement {
  return {
    id: dto.id,
    productCode: dto.product.code,
    productName: dto.product.name,
    type: dto.type,
    quantity: Number(dto.quantity),
    adjustmentReason: dto.adjustmentReason,
    referenceNumber: dto.referenceNumber,
    notes: dto.notes,
    performedBy: dto.performedBy
      ? `${dto.performedBy.user.firstName} ${dto.performedBy.user.lastName}`.trim()
      : null,
    createdAt: dto.createdAt,
  };
}

export function mapInventoryMovementsPageToUi(
  response: PaginatedResponse<InventoryMovementDto>,
): PaginatedResponse<InventoryMovement> {
  return {
    items: response.items.map(mapInventoryMovementDtoToUi),
    meta: response.meta,
  };
}
