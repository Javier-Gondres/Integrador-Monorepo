import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CustomerDto, CustomerFormValues } from "../types/customer.types";

export async function updateCustomer(id: string, data: CustomerFormValues) {
  return apiFetch<CustomerDto>(ENDPOINTS.customers.byId(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
