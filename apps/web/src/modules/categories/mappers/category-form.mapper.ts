import type { CategoryFormSchema } from "../schemas/category.schema";
import type { Category, CategoryFormValues } from "../types/category.types";

export function mapCategoryToFormValues(
  category: Category | null,
): CategoryFormSchema {
  return {
    name: category?.name ?? "",
    description: category?.description ?? "",
    isActive: category?.isActive ?? true,
  };
}

export function mapFormValuesToDto(values: CategoryFormSchema): CategoryFormValues {
  return {
    name: values.name,
    description: values.description || undefined,
    isActive: values.isActive,
  };
}
