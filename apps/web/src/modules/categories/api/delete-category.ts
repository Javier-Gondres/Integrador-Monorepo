import { apiFetch } from "@/lib/api/client";

export async function deleteCategory(id: string) {
  return apiFetch<void>(`/categories/${id}`, {
    method: "DELETE",
  });
}
