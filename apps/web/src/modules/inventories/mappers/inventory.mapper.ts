import type { PaginatedResponse } from "@/types/pagination";

import type { Inventory, InventoryDto } from "../types/inventory.types";

export function mapInventoryDtoToUi(dto: InventoryDto): Inventory {
  return {
    id: dto.id,
    branchId: dto.branchId,
    productId: dto.productId,
    code: dto.product.code,
    name: dto.product.name,
    quantity: Number(dto.quantity),
    price: Number(dto.product.price),
    isActive: dto.product.isActive,
  };
}

export function mapInventoriesPageToUi(
  response: PaginatedResponse<InventoryDto>,
): PaginatedResponse<Inventory> {
  return {
    items: response.items.map(mapInventoryDtoToUi),
    meta: response.meta,
  };
}
