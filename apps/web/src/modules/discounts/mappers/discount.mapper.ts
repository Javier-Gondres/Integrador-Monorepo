import type { PaginatedResponse } from "@/types/pagination";

import type {
  Discount,
  DiscountCalculation,
  DiscountDto,
} from "../types/discount.types";

export function mapDiscountDtoToUi(dto: DiscountDto): Discount {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    percentage: dto.percentage,
    startDate: dto.startDate,
    endDate: dto.endDate,
    products: dto.products ?? [],
    categories: dto.categories ?? [],
    excludedProducts: dto.excludedProducts ?? [],
    isActive: dto.isActive,
  };
}

export function mapDiscountsPageToUi(
  response: PaginatedResponse<DiscountDto>,
): PaginatedResponse<Discount> {
  return {
    items: response.items.map(mapDiscountDtoToUi),
    meta: response.meta,
  };
}

export function mapDiscountCalculationToUi(
  response: DiscountCalculation,
): DiscountCalculation {
  return response;
}
