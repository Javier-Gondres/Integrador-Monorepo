import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export interface CheckCustomerUniquenessParams {
  [key: string]: string | undefined;
  email?: string;
  cedula?: string;
  excludeId?: string;
}

export interface CheckCustomerUniquenessResponse {
  emailTaken: boolean;
  cedulaTaken: boolean;
}

export async function checkCustomerUniqueness(
  params: CheckCustomerUniquenessParams,
) {
  return apiFetch<CheckCustomerUniquenessResponse>(
    ENDPOINTS.customers.checkUniqueness,
    {
      params,
    },
  );
}
