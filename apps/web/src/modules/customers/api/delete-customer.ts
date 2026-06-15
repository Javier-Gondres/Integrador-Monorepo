import { apiFetch } from "@/lib/api/client";

export async function deleteCustomer(id: string) {
  return apiFetch<void>(`/customers/${id}`, {
    method: "DELETE",
  });
}
