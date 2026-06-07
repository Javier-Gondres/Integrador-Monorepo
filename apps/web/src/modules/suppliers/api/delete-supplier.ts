import { apiFetch } from "@/lib/api/client";

export async function deleteSupplier(id: string) {
  return apiFetch<{ message: string }>(`/suppliers/${id}`, {
    method: "DELETE",
  });
}
