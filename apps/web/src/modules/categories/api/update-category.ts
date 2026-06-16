import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CategoryDto, CategoryFormValues } from "../types/category.types";

export async function updateCategory(id: string, data: CategoryFormValues) {
  return apiFetch<CategoryDto>(ENDPOINTS.categories.byId(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
