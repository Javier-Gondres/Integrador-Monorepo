import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CategoryDto, CategoryFormValues } from "../types/category.types";

export async function createCategory(data: CategoryFormValues) {
  return apiFetch<CategoryDto>(ENDPOINTS.categories.root, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
