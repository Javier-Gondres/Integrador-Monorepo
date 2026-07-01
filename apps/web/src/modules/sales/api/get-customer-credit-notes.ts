import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CreditNotesResponse } from "../types/sale.types";

export async function getCustomerCreditNotes(customerId: string) {
  return apiFetch<CreditNotesResponse>(ENDPOINTS.sales.creditNotes, {
    params: { customerId },
  });
}
