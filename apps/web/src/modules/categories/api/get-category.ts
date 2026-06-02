import { apiFetch } from "@/lib/api/client";

import type { CategoryDto } from "../types/category.types";

export async function getCategory(id: string) {
  return apiFetch<CategoryDto>(`/categories/${id}`);
}
