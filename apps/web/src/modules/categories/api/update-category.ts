import { apiFetch } from "@/lib/api/client";

import type { CategoryDto, CategoryFormValues } from "../types/category.types";

export async function updateCategory(id: string, data: CategoryFormValues) {
  return apiFetch<CategoryDto>(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
