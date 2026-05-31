import type { PaginatedResponse } from "@/types/pagination";

import type { Category, CategoryDto } from "../types/category.types";

export function mapCategoryDtoToUi(dto: CategoryDto): Category {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    isActive: dto.isActive,
  };
}

export function mapCategoriesPageToUi(
  response: PaginatedResponse<CategoryDto>,
): PaginatedResponse<Category> {
  return {
    items: response.items.map(mapCategoryDtoToUi),
    meta: response.meta,
  };
}
