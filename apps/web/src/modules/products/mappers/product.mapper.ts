import type { PaginatedResponse } from "@/types/pagination";

import type { Product, ProductDto } from "../types/product.types";

export function mapProductDtoToUi(dto: ProductDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    code: dto.code,
    description: dto.description,
    price: dto.price,
    categories: dto.categories ?? [],
    isActive: dto.isActive,
  };
}

export function mapProductsPageToUi(
  response: PaginatedResponse<ProductDto>,
): PaginatedResponse<Product> {
  return {
    items: response.items.map(mapProductDtoToUi),
    meta: response.meta,
  };
}

export function mapProductDtoListToUi(dtos: ProductDto[]): Product[] {
  return dtos.map(mapProductDtoToUi);
}
