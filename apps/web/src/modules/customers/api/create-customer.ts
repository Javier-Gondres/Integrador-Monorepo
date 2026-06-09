import { apiFetch } from "@/lib/api/client";

import type { CustomerDto, CustomerFormValues } from "../types/customer.types";

export async function createCustomer(data: CustomerFormValues) {
  return apiFetch<CustomerDto>("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
