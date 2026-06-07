import { HttpStatus } from '@nestjs/common';
import type { InventoryMovementType } from '@repo/db';

import { ErrorCodes } from '../constants/error-codes';
import { BusinessException } from './business.exception';

/**
 * Errores del dominio de inventario y caja.
 */
export class InventoryException extends BusinessException {
  static insufficientStock(productName?: string): InventoryException {
    const suffix = productName ? ` para "${productName}"` : '';
    return new InventoryException(
      ErrorCodes.INSUFFICIENT_STOCK,
      `Stock insuficiente${suffix}`,
      HttpStatus.CONFLICT,
    );
  }

  static productNotFound(productId?: string): InventoryException {
    const suffix = productId ? ` (id: ${productId})` : '';
    return new InventoryException(
      ErrorCodes.PRODUCT_NOT_FOUND,
      `Producto no encontrado${suffix}`,
      HttpStatus.NOT_FOUND,
    );
  }

  static boxClosed(): InventoryException {
    return new InventoryException(
      ErrorCodes.BOX_CLOSED,
      'La caja está cerrada; no se pueden registrar movimientos',
      HttpStatus.CONFLICT,
    );
  }

  static adjustmentReasonRequired(
    type: InventoryMovementType,
  ): InventoryException {
    return new InventoryException(
      ErrorCodes.ADJUSTMENT_REASON_REQUIRED,
      `adjustmentReason es obligatorio para movimientos de tipo ${type}`,
      HttpStatus.BAD_REQUEST,
    );
  }

  static adjustmentReasonNotAllowed(
    type: InventoryMovementType,
  ): InventoryException {
    return new InventoryException(
      ErrorCodes.ADJUSTMENT_REASON_NOT_ALLOWED,
      `adjustmentReason no aplica para movimientos de tipo ${type}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
