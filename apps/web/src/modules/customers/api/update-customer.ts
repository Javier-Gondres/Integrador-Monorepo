import { apiFetch } from "@/lib/api/client";

import type { CustomerDto, CustomerFormValues } from "../types/customer.types";

export async function updateCustomer(id: string, data: CustomerFormValues) {
  return apiFetch<CustomerDto>(`/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
