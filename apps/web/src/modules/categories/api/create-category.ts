import { apiFetch } from "@/lib/api/client";

import type { CategoryDto, CategoryFormValues } from "../types/category.types";

export async function createCategory(data: CategoryFormValues) {
  return apiFetch<CategoryDto>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
