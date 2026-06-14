import type { CustomerFormSchema } from "../schemas/customer.schema";
import type { Customer, CustomerFormValues } from "../types/customer.types";
import {
  formatCedulaMask,
  formatPhoneMask,
  normalizeCedulaValue,
  normalizePhoneValue,
} from "../utils/customer-formatters";

export function mapCustomerToFormValues(
  customer: Customer | null,
): CustomerFormSchema {
  return {
    firstName: customer?.firstName ?? "",
    lastName: customer?.lastName ?? "",
    email: customer?.email ?? "",
    phone: formatPhoneMask(customer?.phone ?? ""),
    address: customer?.address ?? "",
    cedula: formatCedulaMask(customer?.cedula ?? ""),
    isActive: customer?.isActive ?? true,
  };
}

export function mapFormValuesToDto(
  values: CustomerFormSchema,
): CustomerFormValues {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email || undefined,
    phone: values.phone ? normalizePhoneValue(values.phone) : undefined,
    address: values.address || undefined,
    cedula: values.cedula ? normalizeCedulaValue(values.cedula) : undefined,
    isActive: values.isActive,
  };
}
