import { prisma, ReservationStatus } from '@repo/db';

import type { ExtendedTransactionClient } from '../ncf/ncf-sequence.helper';

/**
 * Cliente Prisma utilizable tanto fuera como dentro de una transacción. El
 * cliente base (`prisma`) es un superconjunto del cliente de transacción, por lo
 * que es asignable a este tipo.
 */
export type AvailabilityClient = ExtendedTransactionClient;

export type ProductAvailability = {
  /** Existencia física proyectada en `Inventory`. */
  physical: number;
  /** Unidades bloqueadas por reservas `ACTIVE`. */
  reserved: number;
  /** `physical - reserved`: lo que realmente se puede vender/reservar. */
  available: number;
};

/**
 * Calcula la disponibilidad por producto en una sucursal:
 *
 * ```
 * disponible = Inventory.quantity − SUM(ReservationItem.quantity
 *               WHERE Reservation.status = ACTIVE [y id ≠ excludeReservationId])
 * ```
 *
 * `excludeReservationId` evita que una reserva bloquee su propia conversión en
 * venta. Pensado para llamarse dentro de la misma transacción que descuenta el
 * inventario (pasar el `tx`), o suelto para lecturas (pasar `prisma`).
 */
export async function getAvailabilityMap(
  client: AvailabilityClient,
  branchId: string,
  productIds: string[],
  options?: { excludeReservationId?: string },
): Promise<Map<string, ProductAvailability>> {
  const result = new Map<string, ProductAvailability>();
  if (productIds.length === 0) {
    return result;
  }

  const [inventories, reservedGroups] = await Promise.all([
    client.inventory.findMany({
      where: { branchId, productId: { in: productIds } },
      select: { productId: true, quantity: true },
    }),
    client.reservationItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds },
        reservation: {
          branchId,
          status: ReservationStatus.ACTIVE,
          ...(options?.excludeReservationId && {
            id: { not: options.excludeReservationId },
          }),
        },
      },
      _sum: { quantity: true },
    }),
  ]);

  const physicalByProduct = new Map<string, number>();
  for (const inv of inventories) {
    physicalByProduct.set(inv.productId, Number(inv.quantity));
  }

  const reservedByProduct = new Map<string, number>();
  for (const group of reservedGroups) {
    reservedByProduct.set(group.productId, Number(group._sum.quantity ?? 0));
  }

  for (const productId of productIds) {
    const physical = physicalByProduct.get(productId) ?? 0;
    const reserved = reservedByProduct.get(productId) ?? 0;
    result.set(productId, {
      physical,
      reserved,
      available: physical - reserved,
    });
  }

  return result;
}

/** Atajo: instancia base de Prisma para llamadas fuera de transacción. */
export const availabilityPrisma = prisma;
