import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CustomerDto } from "../types/customer.types";

export async function activateCustomer(id: string) {
  return apiFetch<CustomerDto>(ENDPOINTS.customers.activate(id), {
    method: "PATCH",
  });
}

export async function deactivateCustomer(id: string) {
  return apiFetch<CustomerDto>(ENDPOINTS.customers.deactivate(id), {
    method: "PATCH",
  });
}
