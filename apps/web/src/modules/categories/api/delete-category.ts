import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function deleteCategory(id: string) {
  return apiFetch<void>(ENDPOINTS.categories.byId(id), {
    method: "DELETE",
  });
}
