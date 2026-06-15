import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { AbrirTurnoPayload } from "../types/caja.types";

export async function openShift(
  cajaId: string,
  payload: Omit<AbrirTurnoPayload, "cajaId">,
) {
  return apiFetch<{ message: string }>(
    ENDPOINTS.cashRegisters.openShift(cajaId),
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
