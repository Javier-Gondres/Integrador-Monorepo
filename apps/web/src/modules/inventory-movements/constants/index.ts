import type {
  AdjustmentReason,
  MovementType,
} from "../types/inventory-movement.types";

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  PURCHASE: "Compra",
  SALE: "Venta",
  RETURN: "Devolución",
  TRANSFER_IN: "Transferencia (entrada)",
  TRANSFER_OUT: "Transferencia (salida)",
  ADJUSTMENT: "Ajuste",
  WASTE: "Merma",
};

export const MOVEMENT_TYPE_OPTIONS: { value: MovementType; label: string }[] = (
  Object.keys(MOVEMENT_TYPE_LABELS) as MovementType[]
).map((value) => ({ value, label: MOVEMENT_TYPE_LABELS[value] }));

export const ADJUSTMENT_REASON_LABELS: Record<AdjustmentReason, string> = {
  DAMAGE: "Daño",
  THEFT: "Robo",
  EXPIRED: "Vencido",
  COUNT_DIFFERENCE: "Diferencia de conteo",
  INTERNAL_USE: "Uso interno",
  OTHER: "Otro",
};

export type MovementDirection = "in" | "out" | "neutral";

/**
 * Dirección del movimiento (para signo y color en la tabla). Convención de
 * presentación a revisar cuando el lado de escritura defina el signo guardado.
 */
export const MOVEMENT_DIRECTION: Record<MovementType, MovementDirection> = {
  PURCHASE: "in",
  RETURN: "in",
  TRANSFER_IN: "in",
  SALE: "out",
  WASTE: "out",
  TRANSFER_OUT: "out",
  ADJUSTMENT: "neutral",
};
