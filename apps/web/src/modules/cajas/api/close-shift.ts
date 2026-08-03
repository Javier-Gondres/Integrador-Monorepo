import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CerrarTurnoPayload } from "../types/caja.types";

export async function closeShift(
  cajaId: string,
  shiftId: string,
  payload: Pick<CerrarTurnoPayload, "montoCierre">,
) {
  return apiFetch<{ message: string }>(
    ENDPOINTS.cashRegisters.closeShift(cajaId, shiftId),
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
