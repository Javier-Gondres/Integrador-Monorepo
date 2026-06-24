import { Injectable } from '@nestjs/common';
import {
  InventoryMovementType,
  NcfType,
  Prisma,
  prisma,
  ReturnReason,
} from '@repo/db';
import { generateNcf } from 'src/common/ncf/ncf-sequence.helper';
import { PaginatedResult } from 'src/common/types/repository.types';

import { NormalizedQueryReturns } from './dto/query-returns.dto';
import {
  ReturnDetailRecord,
  returnDetailSelect,
  ReturnListRecord,
  returnListSelect,
  SaleLookupRecord,
  saleLookupSelect,
} from './returns.selects';

export type PaginatedReturnsResult = PaginatedResult<ReturnListRecord>;

export type CreateReturnItemData = {
  productId: string;
  quantity: number;
  subtotal: number;
};

export type CreateReturnData = {
  companyId: string;
  branchId: string;
  saleId: string;
  employeeId: string;
  customerId: string | null;
  userId: string;
  reason: ReturnReason;
  notes: string | null;
  subtotal: number;
  total: number;
  items: CreateReturnItemData[];
};

@Injectable()
export class ReturnsRepository {
  async findPaginatedByCompany(
    companyId: string,
    query: NormalizedQueryReturns,
  ): Promise<PaginatedReturnsResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.return.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
        select: returnListSelect,
      }),
      prisma.return.count({ where }),
    ]);

    return { items, total };
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<ReturnDetailRecord | null> {
    return prisma.return.findFirst({
      where: { id, branch: { companyId } },
      select: returnDetailSelect,
    });
  }

  findSaleByNcf(
    companyId: string,
    ncf: string,
  ): Promise<SaleLookupRecord | null> {
    return prisma.sale.findFirst({
      where: { ncf, branch: { companyId } },
      select: saleLookupSelect,
    });
  }

  findSaleByIdInCompany(
    companyId: string,
    saleId: string,
  ): Promise<SaleLookupRecord | null> {
    return prisma.sale.findFirst({
      where: { id: saleId, branch: { companyId } },
      select: saleLookupSelect,
    });
  }

  /**
   * Registra una devolución de forma atómica: crea el Return + ítems, repone el
   * inventario de la sucursal con un InventoryMovement(RETURN) por producto y
   * emite una Nota de Crédito (NCF tipo NOTA_DE_CREDITO) si hay secuencia DGII
   * disponible. Todo ocurre en una sola transacción para no romper la
   * trazabilidad del stock ni del documento fiscal.
   */
  async createReturn(data: CreateReturnData): Promise<ReturnDetailRecord> {
    return prisma.$transaction(async (tx) => {
      const created = await tx.return.create({
        data: {
          branchId: data.branchId,
          saleId: data.saleId,
          employeeId: data.employeeId,
          reason: data.reason,
          notes: data.notes,
          subtotal: new Prisma.Decimal(data.subtotal),
          total: new Prisma.Decimal(data.total),
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: new Prisma.Decimal(item.quantity),
              subtotal: new Prisma.Decimal(item.subtotal),
            })),
          },
        },
        select: { id: true },
      });

      for (const item of data.items) {
        const quantity = new Prisma.Decimal(item.quantity);

        await tx.inventory.upsert({
          where: {
            branchId_productId: {
              branchId: data.branchId,
              productId: item.productId,
            },
          },
          update: { quantity: { increment: quantity } },
          create: {
            branchId: data.branchId,
            productId: item.productId,
            quantity,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            branchId: data.branchId,
            productId: item.productId,
            type: InventoryMovementType.RETURN,
            quantity,
            returnId: created.id,
            performedByEmployeeId: data.employeeId,
            notes: 'Devolución registrada',
          },
        });
      }

      const generated = await generateNcf(
        tx,
        data.companyId,
        NcfType.NOTA_DE_CREDITO,
      );

      await tx.creditNote.create({
        data: {
          returnId: created.id,
          customerId: data.customerId,
          amount: new Prisma.Decimal(data.total),
          ...(generated && {
            ncf: generated.ncf,
            ncfType: generated.ncfType,
            ncfSequenceId: generated.ncfSequenceId,
          }),
        },
      });

      await tx.auditLog.create({
        data: {
          companyId: data.companyId,
          branchId: data.branchId,
          userId: data.userId,
          action: 'CREATE_RETURN',
          entity: 'Return',
          entityId: created.id,
          metadata: {
            saleId: data.saleId,
            reason: data.reason,
            total: data.total,
          },
        },
      });

      return tx.return.findUniqueOrThrow({
        where: { id: created.id },
        select: returnDetailSelect,
      });
    });
  }

  private buildListWhere(
    companyId: string,
    query: NormalizedQueryReturns,
  ): Prisma.ReturnWhereInput {
    return {
      branch: { companyId },
      ...(query.branchId && { branchId: query.branchId }),
      ...((query.dateFrom || query.dateTo) && {
        createdAt: {
          ...(query.dateFrom && { gte: query.dateFrom }),
          ...(query.dateTo && { lte: query.dateTo }),
        },
      }),
      ...(query.search && {
        OR: [
          { branch: { name: { contains: query.search, mode: 'insensitive' } } },
          { sale: { ncf: { contains: query.search, mode: 'insensitive' } } },
          {
            creditNotes: {
              some: { ncf: { contains: query.search, mode: 'insensitive' } },
            },
          },
          {
            sale: {
              customer: {
                OR: [
                  {
                    firstName: {
                      contains: query.search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    lastName: { contains: query.search, mode: 'insensitive' },
                  },
                ],
              },
            },
          },
        ],
      }),
    };
  }
}
