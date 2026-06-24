import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type {
  CrearTransferenciaPayload,
  TransferDto,
} from "../types/transferencia.types";

export async function createTransfer(data: CrearTransferenciaPayload) {
  return apiFetch<TransferDto>(ENDPOINTS.transfers.root, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
