import { apiFetch } from "@/lib/api/client";

export async function deleteEmployee(id: string) {
  return apiFetch<{ message: string }>(`/employees/${id}`, {
    method: "DELETE",
  });
}
