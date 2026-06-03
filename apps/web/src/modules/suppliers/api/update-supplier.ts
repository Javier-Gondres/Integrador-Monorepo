import { apiFetch } from "@/lib/api/client";

import type { SupplierDto, SupplierFormValues } from "../types/supplier.types";

export async function updateSupplier(id: string, data: SupplierFormValues) {
  return apiFetch<SupplierDto>(`/suppliers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
