import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CustomerDto, CustomerFormValues } from "../types/customer.types";

export async function createCustomer(data: CustomerFormValues) {
  return apiFetch<CustomerDto>(ENDPOINTS.customers.root, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
