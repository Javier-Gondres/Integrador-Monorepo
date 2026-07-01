import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { SaleLookup } from "../types/return.types";

export async function lookupSaleByNcf(ncf: string) {
  return apiFetch<SaleLookup>(ENDPOINTS.returns.saleLookup, {
    params: { ncf },
  });
}
