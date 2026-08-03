import type { AdjustmentReason } from "../types/inventory-adjustment.types";

export const ADJUSTMENT_REASON_LABELS: Record<AdjustmentReason, string> = {
  COUNT_DIFFERENCE: "Diferencia de conteo",
  OTHER: "Otro",
};

export const ADJUSTMENT_REASON_OPTIONS: {
  value: AdjustmentReason;
  label: string;
}[] = (Object.keys(ADJUSTMENT_REASON_LABELS) as AdjustmentReason[]).map(
  (value) => ({ value, label: ADJUSTMENT_REASON_LABELS[value] }),
);
