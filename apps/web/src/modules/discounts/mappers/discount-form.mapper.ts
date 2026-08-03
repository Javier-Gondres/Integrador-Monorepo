import type { DiscountFormSchema } from "../schemas/discount.schema";
import type { Discount, DiscountFormValuesDto } from "../types/discount.types";

export function mapDiscountToFormValues(
  discount: Discount | null,
): DiscountFormSchema {
  return {
    name: discount?.name ?? "",
    description: discount?.description ?? "",
    percentage: discount?.percentage ?? 0,
    startDate: discount?.startDate ? discount.startDate.slice(0, 10) : "",
    endDate: discount?.endDate ? discount.endDate.slice(0, 10) : "",
    productIds: discount?.products.map((product) => product.id) ?? [],
    categoryIds: discount?.categories.map((category) => category.id) ?? [],
    excludedProductIds:
      discount?.excludedProducts.map((product) => product.id) ?? [],
    isActive: discount?.isActive ?? true,
  };
}

export function mapFormValuesToDto(
  values: DiscountFormSchema,
): DiscountFormValuesDto {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    percentage: values.percentage,
    // null (no undefined) para que el backend pueda limpiar fechas existentes
    startDate: values.startDate || null,
    endDate: values.endDate || null,
    productIds: values.productIds,
    categoryIds: values.categoryIds,
    excludedProductIds: values.excludedProductIds,
    isActive: values.isActive,
  };
}
