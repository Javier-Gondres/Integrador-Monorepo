import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { TransferDto } from "../types/transferencia.types";

export async function cancelTransfer(id: string) {
  return apiFetch<TransferDto>(ENDPOINTS.transfers.cancel(id), {
    method: "PATCH",
  });
}
