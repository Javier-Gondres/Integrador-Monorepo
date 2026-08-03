import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CategoryDto } from "../types/category.types";

export async function activateCategory(id: string) {
  return apiFetch<CategoryDto>(ENDPOINTS.categories.activate(id), {
    method: "PATCH",
  });
}

export async function deactivateCategory(id: string) {
  return apiFetch<CategoryDto>(ENDPOINTS.categories.deactivate(id), {
    method: "PATCH",
  });
}
