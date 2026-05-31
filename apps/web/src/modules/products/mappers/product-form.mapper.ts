import type { ProductFormSchema } from "../schemas/product.schema";
import type { Product, ProductFormValues } from "../types/product.types";

export function mapProductToFormValues(product: Product | null): ProductFormSchema {
  return {
    name: product?.name ?? "",
    code: product?.code ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    categoryIds: product?.categories.map((c) => c.id) ?? [],
    isActive: product?.isActive ?? true,
  };
}

export function mapFormValuesToDto(values: ProductFormSchema): ProductFormValues {
  return {
    name: values.name,
    code: values.code,
    description: values.description || undefined,
    price: values.price,
    categoryIds: values.categoryIds,
    isActive: values.isActive,
  };
}
