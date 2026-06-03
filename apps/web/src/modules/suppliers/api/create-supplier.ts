import { apiFetch } from "@/lib/api/client";

import type { SupplierDto, SupplierFormValues } from "../types/supplier.types";

export async function createSupplier(data: SupplierFormValues) {
  return apiFetch<SupplierDto>("/suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
