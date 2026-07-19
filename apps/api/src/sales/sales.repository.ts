import { Injectable } from '@nestjs/common';
import {
  InventoryMovementType,
  NcfType,
  PaymentMethod,
  Prisma,
  prisma,
  ReceivableStatus,
  ReservationStatus,
  SaleStatus,
} from '@repo/db';
import { InventoryException } from 'src/common/errors';
import { getAvailabilityMap } from 'src/common/inventory/availability.helper';
import { generateNcf } from 'src/common/ncf/ncf-sequence.helper';
import { PaginatedResult } from 'src/common/types/repository.types';

import { NormalizedQuerySales } from './dto/query-sales.dto';
import { SalesException } from './sales.exception';
import {
  creditNoteForSaleSelect,
  SaleDetailRecord,
  saleDetailSelect,
  SaleListRecord,
  saleListSelect,
} from './sales.selects';

/** Días de plazo por defecto para una venta a crédito (cuenta por cobrar). */
const CREDIT_DUE_DAYS = 30;

export type PaginatedSalesResult = PaginatedResult<SaleListRecord>;

export type CreateSaleLine = {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  subtotal: number;
};

export type CreateSalePaymentData = {
  method: PaymentMethod;
  amount: number;
};

export type CreateSaleData = {
  companyId: string;
  branchId: string;
  customerId: string | null;
  reservationId: string | null;
  employeeId: string;
  userId: string;
  ncfType: NcfType;
  subtotal: number;
  taxAmount: number;
  total: number;
  lines: CreateSaleLine[];
  payments: CreateSalePaymentData[];
  creditNoteIds: string[];
  /** Fecha en que ocurrió la venta (venta pasada). `null` = fecha actual. */
  soldAt: Date | null;
};

@Injectable()
export class SalesRepository {
  /**
   * Registra una venta de forma atómica (venta al contado, a crédito o mixta,
   * con o sin reserva de origen y con notas de crédito opcionales):
   *
   * 1. Valida un turno de caja abierto del cajero en la sucursal.
   * 2. Valida la reserva de origen (si aplica) y la marca COMPLETED al final.
   * 3. Valida disponibilidad por producto (físico − reservas activas).
   * 4. Redime notas de crédito completas como crédito de tienda.
   * 5. Valida que la suma de pagos cuadre con el monto a pagar.
   * 6. Reserva el NCF de la secuencia DGII activa.
   * 7. Crea Sale + SaleItem + Payment, descuenta inventario con
   *    InventoryMovement(SALE), crea AccountReceivable por la porción a crédito
   *    y registra el AuditLog. Todo en una sola transacción.
   */
  async createSale(data: CreateSaleData): Promise<SaleDetailRecord> {
    return prisma.$transaction(async (tx) => {
      const shift = await tx.cashShift.findFirst({
        where: {
          closedAt: null,
          cashierId: data.employeeId,
          cashRegister: { branchId: data.branchId },
        },
        select: { id: true },
      });
      if (!shift) {
        throw SalesException.noOpenCashShift();
      }

      if (data.reservationId) {
        const reservation = await tx.reservation.findFirst({
          where: {
            id: data.reservationId,
            branchId: data.branchId,
            companyId: data.companyId,
          },
          select: { status: true },
        });
        if (!reservation) {
          throw SalesException.reservationNotFound();
        }
        if (reservation.status !== ReservationStatus.ACTIVE) {
          throw SalesException.reservationNotActive();
        }
      }

      const productIds = data.lines.map((line) => line.productId);
      const availability = await getAvailabilityMap(
        tx,
        data.branchId,
        productIds,
        { excludeReservationId: data.reservationId ?? undefined },
      );
      for (const line of data.lines) {
        const stock = availability.get(line.productId);
        if (!stock || line.quantity > stock.available) {
          throw InventoryException.insufficientStock(line.productId);
        }
      }

      let creditApplied = 0;
      if (data.creditNoteIds.length > 0) {
        const notes = await tx.creditNote.findMany({
          where: {
            id: { in: data.creditNoteIds },
            isActive: true,
            redeemedInSaleId: null,
            customerId: data.customerId,
            customer: { companyId: data.companyId },
          },
          select: { id: true, amount: true },
        });
        if (notes.length !== data.creditNoteIds.length) {
          throw SalesException.creditNoteNotAvailable();
        }
        creditApplied = round2(
          notes.reduce((sum, note) => sum + Number(note.amount), 0),
        );
      }

      const amountPayable = Math.max(0, round2(data.total - creditApplied));

      const paymentsTotal = round2(
        data.payments.reduce((sum, payment) => sum + payment.amount, 0),
      );
      if (paymentsTotal !== amountPayable) {
        throw SalesException.paymentsTotalMismatch(
          amountPayable,
          paymentsTotal,
        );
      }

      const creditPortion = round2(
        data.payments
          .filter((payment) => payment.method === PaymentMethod.CREDIT)
          .reduce((sum, payment) => sum + payment.amount, 0),
      );
      if (creditPortion > 0 && !data.customerId) {
        throw SalesException.customerRequiredForCredit();
      }

      const generated = await generateNcf(tx, data.companyId, data.ncfType);

      const sale = await tx.sale.create({
        data: {
          branchId: data.branchId,
          customerId: data.customerId,
          cashierId: data.employeeId,
          cashShiftId: shift.id,
          reservationId: data.reservationId,
          subtotal: new Prisma.Decimal(data.subtotal),
          taxAmount: new Prisma.Decimal(data.taxAmount),
          total: new Prisma.Decimal(data.total),
          status: SaleStatus.COMPLETED,
          ...(data.soldAt && { createdAt: data.soldAt }),
          ...(generated && {
            ncf: generated.ncf,
            ncfType: generated.ncfType,
            ncfSequenceId: generated.ncfSequenceId,
          }),
          items: {
            create: data.lines.map((line) => ({
              productId: line.productId,
              quantity: new Prisma.Decimal(line.quantity),
              unitPrice: new Prisma.Decimal(line.unitPrice),
              discountPercentage:
                line.discountPercentage > 0
                  ? new Prisma.Decimal(line.discountPercentage)
                  : null,
              discountAmount:
                line.discountAmount > 0
                  ? new Prisma.Decimal(line.discountAmount)
                  : null,
              subtotal: new Prisma.Decimal(line.subtotal),
            })),
          },
          ...(data.payments.length > 0 && {
            payments: {
              create: data.payments.map((payment) => ({
                method: payment.method,
                amount: new Prisma.Decimal(payment.amount),
              })),
            },
          }),
        },
        select: { id: true },
      });

      for (const line of data.lines) {
        const quantity = new Prisma.Decimal(line.quantity);

        await tx.inventory.update({
          where: {
            branchId_productId: {
              branchId: data.branchId,
              productId: line.productId,
            },
          },
          data: { quantity: { decrement: quantity } },
        });

        await tx.inventoryMovement.create({
          data: {
            branchId: data.branchId,
            productId: line.productId,
            type: InventoryMovementType.SALE,
            quantity,
            saleId: sale.id,
            performedByEmployeeId: data.employeeId,
            notes: 'Venta registrada',
            ...(data.soldAt && { createdAt: data.soldAt }),
          },
        });
      }

      if (creditPortion > 0 && data.customerId) {
        const dueDate = new Date(data.soldAt ?? Date.now());
        dueDate.setDate(dueDate.getDate() + CREDIT_DUE_DAYS);

        await tx.accountReceivable.create({
          data: {
            customerId: data.customerId,
            saleId: sale.id,
            originalAmount: new Prisma.Decimal(creditPortion),
            balance: new Prisma.Decimal(creditPortion),
            dueDate,
            status: ReceivableStatus.OPEN,
            ...(data.soldAt && { createdAt: data.soldAt }),
          },
        });
      }

      if (data.creditNoteIds.length > 0) {
        await tx.creditNote.updateMany({
          where: { id: { in: data.creditNoteIds } },
          data: {
            isActive: false,
            redeemedAt: new Date(),
            redeemedInSaleId: sale.id,
          },
        });
      }

      if (data.reservationId) {
        await tx.reservation.update({
          where: { id: data.reservationId },
          data: { status: ReservationStatus.COMPLETED },
        });
      }

      await tx.auditLog.create({
        data: {
          companyId: data.companyId,
          branchId: data.branchId,
          userId: data.userId,
          action: 'SALE_CREATED',
          entity: 'Sale',
          entityId: sale.id,
          metadata: {
            total: data.total,
            creditApplied,
            amountPayable,
          },
        },
      });

      return tx.sale.findUniqueOrThrow({
        where: { id: sale.id },
        select: saleDetailSelect,
      });
    });
  }

  async findPaginatedByCompany(
    companyId: string,
    query: NormalizedQuerySales,
  ): Promise<PaginatedSalesResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.sale.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
        select: saleListSelect,
      }),
      prisma.sale.count({ where }),
    ]);

    return { items, total };
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<SaleDetailRecord | null> {
    return prisma.sale.findFirst({
      where: { id, branch: { companyId } },
      select: saleDetailSelect,
    });
  }

  findCurrentShift(employeeId: string, branchId: string) {
    return prisma.cashShift.findFirst({
      where: {
        closedAt: null,
        cashierId: employeeId,
        cashRegister: { branchId },
      },
      select: {
        id: true,
        openingAmount: true,
        openedAt: true,
        cashRegister: { select: { id: true, name: true } },
      },
    });
  }

  findActiveCreditNotesByCustomer(companyId: string, customerId: string) {
    return prisma.creditNote.findMany({
      where: {
        customerId,
        isActive: true,
        redeemedInSaleId: null,
        customer: { companyId },
      },
      orderBy: { createdAt: 'asc' },
      select: creditNoteForSaleSelect,
    });
  }

  async findProductsForSale(
    companyId: string,
    branchId: string,
    filters: { search?: string; categoryId?: string },
  ) {
    const inventories = await prisma.inventory.findMany({
      where: {
        branchId,
        isActive: true,
        product: {
          companyId,
          isActive: true,
          ...(filters.categoryId && {
            categories: { some: { id: filters.categoryId } },
          }),
          ...(filters.search && {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { code: { contains: filters.search, mode: 'insensitive' } },
            ],
          }),
        },
      },
      orderBy: { product: { name: 'asc' } },
      select: {
        quantity: true,
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            price: true,
            categories: { select: { id: true, name: true } },
          },
        },
      },
    });

    const productIds = inventories.map((inv) => inv.product.id);
    const availability = await getAvailabilityMap(prisma, branchId, productIds);

    return inventories.map((inv) => ({
      product: inv.product,
      available:
        availability.get(inv.product.id)?.available ?? Number(inv.quantity),
    }));
  }

  private buildListWhere(
    companyId: string,
    query: NormalizedQuerySales,
  ): Prisma.SaleWhereInput {
    return {
      branch: { companyId },
      ...(query.branchId && { branchId: query.branchId }),
      ...(query.customerId && { customerId: query.customerId }),
      ...(query.cashierId && { cashierId: query.cashierId }),
      ...(query.cashRegisterId && {
        cashShift: { cashRegisterId: query.cashRegisterId },
      }),
      ...(query.status && { status: query.status }),
      ...((query.dateFrom || query.dateTo) && {
        createdAt: {
          ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
          ...(query.dateTo && { lte: new Date(query.dateTo) }),
        },
      }),
      ...(query.search && {
        OR: [
          { ncf: { contains: query.search, mode: 'insensitive' } },
          {
            customer: {
              OR: [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      }),
    };
  }
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
