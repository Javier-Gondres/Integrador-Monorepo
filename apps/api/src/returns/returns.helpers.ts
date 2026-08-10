import { SaleStatus } from '@repo/db';
import { BusinessException, ErrorCodes } from 'src/common/errors';

import type { CreateReturnItemData } from './returns.repository';
import type { SaleLookupRecord } from './returns.selects';

export type ReturnItemInput = {
  productId: string;
  quantity: number;
};

export type SoldEntry = {
  productId: string;
  code: string;
  name: string;
  quantitySold: number;
  subtotalPaid: number;
};

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function round3(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

export function effectiveUnitPrice(sold: SoldEntry): number {
  if (sold.quantitySold <= 0) {
    return 0;
  }
  return round2(sold.subtotalPaid / sold.quantitySold);
}

export function buildSoldByProduct(
  sale: SaleLookupRecord,
): Map<string, SoldEntry> {
  const map = new Map<string, SoldEntry>();

  for (const item of sale.items) {
    const quantity = Number(item.quantity);
    const subtotal = Number(item.subtotal);
    const existing = map.get(item.productId);

    if (existing) {
      existing.quantitySold += quantity;
      existing.subtotalPaid += subtotal;
    } else {
      map.set(item.productId, {
        productId: item.productId,
        code: item.product.code,
        name: item.product.name,
        quantitySold: quantity,
        subtotalPaid: subtotal,
      });
    }
  }

  return map;
}

export function buildAlreadyReturned(
  sale: SaleLookupRecord,
): Map<string, number> {
  const map = new Map<string, number>();

  for (const ret of sale.returns) {
    for (const item of ret.items) {
      map.set(
        item.productId,
        (map.get(item.productId) ?? 0) + Number(item.quantity),
      );
    }
  }

  return map;
}

/**
 * Valida cantidades devolvibles y calcula subtotales desde la venta.
 * Debe ejecutarse con datos de venta leídos dentro de la misma transacción.
 */
export function validateAndPriceReturnItems(
  sale: SaleLookupRecord,
  items: ReturnItemInput[],
): CreateReturnItemData[] {
  if (sale.status !== SaleStatus.COMPLETED) {
    throw new BusinessException(
      ErrorCodes.SALE_NOT_COMPLETED,
      'Solo se pueden devolver productos de ventas completadas',
    );
  }

  const productIds = items.map((item) => item.productId);
  if (new Set(productIds).size !== productIds.length) {
    throw new BusinessException(
      ErrorCodes.VALIDATION_ERROR,
      'Hay productos duplicados en la devolución',
    );
  }

  const soldByProduct = buildSoldByProduct(sale);
  const alreadyReturned = buildAlreadyReturned(sale);

  return items.map((item) => {
    const sold = soldByProduct.get(item.productId);
    if (!sold) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'El producto no pertenece a la venta indicada',
      );
    }

    const returnable = round3(
      sold.quantitySold - (alreadyReturned.get(item.productId) ?? 0),
    );
    if (item.quantity > returnable) {
      throw new BusinessException(
        ErrorCodes.RETURN_QUANTITY_EXCEEDED,
        `No se pueden devolver más de ${returnable} unidades de ${sold.name}`,
      );
    }

    const unitPrice = effectiveUnitPrice(sold);
    return {
      productId: item.productId,
      quantity: item.quantity,
      subtotal: round2(unitPrice * item.quantity),
    };
  });
}
