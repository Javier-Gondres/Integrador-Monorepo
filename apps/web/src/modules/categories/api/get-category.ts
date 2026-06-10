import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CategoryDto } from "../types/category.types";

export async function getCategory(id: string) {
  return apiFetch<CategoryDto>(ENDPOINTS.categories.byId(id));
}
