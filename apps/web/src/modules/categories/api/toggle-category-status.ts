import { apiFetch } from "@/lib/api/client";

import type { CategoryDto } from "../types/category.types";

export async function activateCategory(id: string) {
  return apiFetch<CategoryDto>(`/categories/${id}/activate`, {
    method: "PATCH",
  });
}

export async function deactivateCategory(id: string) {
  return apiFetch<CategoryDto>(`/categories/${id}/deactivate`, {
    method: "PATCH",
  });
}
