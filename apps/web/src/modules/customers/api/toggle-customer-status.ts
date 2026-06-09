import { apiFetch } from "@/lib/api/client";

import type { CustomerDto } from "../types/customer.types";

export async function activateCustomer(id: string) {
  return apiFetch<CustomerDto>(`/customers/${id}/activate`, {
    method: "PATCH",
  });
}

export async function deactivateCustomer(id: string) {
  return apiFetch<CustomerDto>(`/customers/${id}/deactivate`, {
    method: "PATCH",
  });
}
