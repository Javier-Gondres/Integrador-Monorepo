import { apiFetch } from "@/lib/api/client";

export async function deleteProduct(id: string) {
  return apiFetch<void>(`/products/${id}`, {
    method: "DELETE",
  });
}
