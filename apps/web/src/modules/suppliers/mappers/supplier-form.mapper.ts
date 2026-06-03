import type { SupplierFormSchema } from "../schemas/supplier.schema";
import type { Supplier, SupplierFormValues } from "../types/supplier.types";

export function mapSupplierToFormValues(
  supplier: Supplier | null,
): SupplierFormSchema {
  return {
    name: supplier?.name ?? "",
    contactName: supplier?.contactName ?? "",
    email: supplier?.email ?? "",
    phone: supplier?.phone ?? "",
    rnc: supplier?.rnc ?? "",
    address: supplier?.address ?? "",
    notes: supplier?.notes ?? "",
    isActive: supplier?.isActive ?? true,
  };
}

export function mapFormValuesToDto(
  values: SupplierFormSchema,
): SupplierFormValues {
  return {
    name: values.name,
    contactName: values.contactName || undefined,
    email: values.email || undefined,
    phone: values.phone || undefined,
    rnc: values.rnc || undefined,
    address: values.address || undefined,
    notes: values.notes || undefined,
    isActive: values.isActive,
  };
}
