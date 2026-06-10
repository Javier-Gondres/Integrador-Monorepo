import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { SupplierDto, SupplierFormValues } from "../types/supplier.types";

export async function updateSupplier(id: string, data: SupplierFormValues) {
  return apiFetch<SupplierDto>(ENDPOINTS.suppliers.byId(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
