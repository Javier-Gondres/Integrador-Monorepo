import { InventoryAdjustmentReason, InventoryMovementType } from '@repo/db';
import { InventoryException } from 'src/common/errors';

const REASON_REQUIRED_TYPES: ReadonlySet<InventoryMovementType> = new Set([
  InventoryMovementType.ADJUSTMENT,
  InventoryMovementType.WASTE,
]);

/**
 * Aplica la regla del modelo de dominio: `adjustmentReason` es obligatorio
 * para ADJUSTMENT/WASTE y prohibido para el resto de tipos de movimiento.
 * Prisma no puede expresar esta regla condicional en el schema.
 */
export function normalizeAdjustmentReason(
  type: InventoryMovementType,
  adjustmentReason?: InventoryAdjustmentReason | null,
): InventoryAdjustmentReason | null {
  const requiresReason = REASON_REQUIRED_TYPES.has(type);

  if (requiresReason && !adjustmentReason) {
    throw InventoryException.adjustmentReasonRequired(type);
  }

  if (!requiresReason && adjustmentReason) {
    throw InventoryException.adjustmentReasonNotAllowed(type);
  }

  return requiresReason ? adjustmentReason! : null;
}
