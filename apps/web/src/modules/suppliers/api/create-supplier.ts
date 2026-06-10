import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { SupplierDto, SupplierFormValues } from "../types/supplier.types";

export async function createSupplier(data: SupplierFormValues) {
  return apiFetch<SupplierDto>(ENDPOINTS.suppliers.root, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
