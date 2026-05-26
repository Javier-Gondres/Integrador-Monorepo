import { HttpStatus } from '@nestjs/common';

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
}
