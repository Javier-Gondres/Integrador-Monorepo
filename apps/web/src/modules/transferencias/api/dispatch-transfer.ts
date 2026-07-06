import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { TransferDto } from "../types/transferencia.types";

export async function dispatchTransfer(id: string) {
  return apiFetch<TransferDto>(ENDPOINTS.transfers.dispatch(id), {
    method: "PATCH",
  });
}
