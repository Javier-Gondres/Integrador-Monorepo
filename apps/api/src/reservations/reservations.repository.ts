import { Injectable } from '@nestjs/common';
import { Prisma, prisma, ReservationStatus } from '@repo/db';
import { InventoryException } from 'src/common/errors';
import { getAvailabilityMap } from 'src/common/inventory/availability.helper';
import { PaginatedResult } from 'src/common/types/repository.types';

import { NormalizedQueryReservations } from './dto/query-reservations.dto';
import {
  ReservationDetailRecord,
  reservationDetailSelect,
  ReservationListRecord,
  reservationListSelect,
} from './reservations.selects';

export type PaginatedReservationsResult = PaginatedResult<ReservationListRecord>;

export type CreateReservationItemData = {
  productId: string;
  quantity: number;
};

export type CreateReservationData = {
  companyId: string;
  branchId: string;
  customerId: string | null;
  createdByEmployeeId: string | null;
  userId: string;
  expiresAt: Date | null;
  notes: string | null;
  items: CreateReservationItemData[];
};

@Injectable()
export class ReservationsRepository {
  /**
   * Crea una reserva (bloqueo de disponibilidad) de forma atómica. Valida que
   * cada línea no exceda el disponible (físico − reservas activas). **No** genera
   * `InventoryMovement` ni modifica `Inventory`.
   */
  async createReservation(
    data: CreateReservationData,
  ): Promise<ReservationDetailRecord> {
    return prisma.$transaction(async (tx) => {
      const productIds = data.items.map((item) => item.productId);
      const availability = await getAvailabilityMap(
        tx,
        data.branchId,
        productIds,
      );
      for (const item of data.items) {
        const stock = availability.get(item.productId);
        if (!stock || item.quantity > stock.available) {
          throw InventoryException.insufficientStock(item.productId);
        }
      }

      const created = await tx.reservation.create({
        data: {
          companyId: data.companyId,
          branchId: data.branchId,
          customerId: data.customerId,
          createdByEmployeeId: data.createdByEmployeeId,
          expiresAt: data.expiresAt,
          notes: data.notes,
          status: ReservationStatus.ACTIVE,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: new Prisma.Decimal(item.quantity),
            })),
          },
        },
        select: { id: true },
      });

      await tx.auditLog.create({
        data: {
          companyId: data.companyId,
          branchId: data.branchId,
          userId: data.userId,
          action: 'RESERVATION_CREATED',
          entity: 'Reservation',
          entityId: created.id,
          metadata: { items: data.items.length },
        },
      });

      return tx.reservation.findUniqueOrThrow({
        where: { id: created.id },
        select: reservationDetailSelect,
      });
    });
  }

  async findPaginatedByCompany(
    companyId: string,
    query: NormalizedQueryReservations,
  ): Promise<PaginatedReservationsResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.reservation.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
        select: reservationListSelect,
      }),
      prisma.reservation.count({ where }),
    ]);

    return { items, total };
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<ReservationDetailRecord | null> {
    return prisma.reservation.findFirst({
      where: { id, companyId },
      select: reservationDetailSelect,
    });
  }

  findStatusInCompany(id: string, companyId: string) {
    return prisma.reservation.findFirst({
      where: { id, companyId },
      select: { id: true, status: true, branchId: true },
    });
  }

  async cancel(
    id: string,
    companyId: string,
    userId: string,
    branchId: string,
  ): Promise<ReservationDetailRecord> {
    return prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id },
        data: { status: ReservationStatus.CANCELLED },
      });

      await tx.auditLog.create({
        data: {
          companyId,
          branchId,
          userId,
          action: 'RESERVATION_CANCELLED',
          entity: 'Reservation',
          entityId: id,
        },
      });

      return tx.reservation.findUniqueOrThrow({
        where: { id },
        select: reservationDetailSelect,
      });
    });
  }

  private buildListWhere(
    companyId: string,
    query: NormalizedQueryReservations,
  ): Prisma.ReservationWhereInput {
    return {
      companyId,
      ...(query.branchId && { branchId: query.branchId }),
      ...(query.customerId && { customerId: query.customerId }),
      ...(query.status && { status: query.status }),
    };
  }
}
