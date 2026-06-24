import type { ReturnReason } from "../types/return.types";

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  DEFECTIVE: "Producto defectuoso",
  SALES_ERROR: "Error de venta",
  EXPIRED: "Vencido",
  OTHER: "Otro",
};

export const RETURN_REASON_VALUES = Object.keys(
  RETURN_REASON_LABELS,
) as ReturnReason[];

export function getReturnReasonLabel(reason: ReturnReason): string {
  return RETURN_REASON_LABELS[reason] ?? reason;
}
