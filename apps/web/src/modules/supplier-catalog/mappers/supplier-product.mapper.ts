import type { PaginatedResponse } from "@/types/pagination";

import type {
  SupplierProduct,
  SupplierProductDto,
} from "../types/supplier-product.types";

export function mapSupplierProductDtoToUi(
  dto: SupplierProductDto,
): SupplierProduct {
  return {
    productId: dto.productId,
    supplierId: dto.supplierId,
    isActive: dto.isActive,
    isPreferred: dto.isPreferred,
    lastCost: dto.lastCost,
    code: dto.product.code,
    name: dto.product.name,
    description: dto.product.description,
    price: dto.product.price,
    productIsActive: dto.product.isActive,
  };
}

export function mapSupplierProductsPageToUi(
  response: PaginatedResponse<SupplierProductDto>,
): PaginatedResponse<SupplierProduct> {
  return {
    items: response.items.map(mapSupplierProductDtoToUi),
    meta: response.meta,
  };
}
