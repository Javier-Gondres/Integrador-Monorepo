import { Injectable } from "@nestjs/common";
import { InventoryMovementType, Prisma, prisma } from "@repo/db";
import { PaginatedResult } from "src/common/types/repository.types";

import { NormalizedQueryPurchases } from "./dto/query-purchases.dto";
import {
  PurchaseDetailRecord,
  purchaseDetailSelect,
  PurchaseListRecord,
  purchaseListSelect,
} from "./purchases.selects";

export type PaginatedPurchasesResult = PaginatedResult<PurchaseListRecord>;

export type CreatePurchaseItemData = {
  productId: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
};

export type CreatePurchaseData = {
  branchId: string;
  supplierId: string;
  invoiceNumber: string | null;
  invoiceDate: Date | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  items: CreatePurchaseItemData[];
};

@Injectable()
export class PurchasesRepository {
  async findPaginatedByCompany(
    companyId: string,
    query: NormalizedQueryPurchases,
  ): Promise<PaginatedPurchasesResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.purchase.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { createdAt: "desc" },
        select: purchaseListSelect,
      }),
      prisma.purchase.count({ where }),
    ]);

    return { items, total };
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<PurchaseDetailRecord | null> {
    return prisma.purchase.findFirst({
      where: { id, branch: { companyId } },
      select: purchaseDetailSelect,
    });
  }

  /**
   * Registers a purchase atomically: creates the Purchase + items, raises the
   * inventory quantity, writes a PURCHASE InventoryMovement per item, and
   * refreshes the product↔supplier lastCost. Everything happens in one
   * transaction so stock can never drift from its movement history.
   */
  async create(data: CreatePurchaseData): Promise<PurchaseDetailRecord> {
    return prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          branchId: data.branchId,
          supplierId: data.supplierId,
          invoiceNumber: data.invoiceNumber,
          invoiceDate: data.invoiceDate,
          subtotal: new Prisma.Decimal(data.subtotal),
          taxAmount: new Prisma.Decimal(data.taxAmount),
          total: new Prisma.Decimal(data.total),
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: new Prisma.Decimal(item.quantity),
              unitCost: new Prisma.Decimal(item.unitCost),
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
            type: InventoryMovementType.PURCHASE,
            quantity,
            purchaseId: purchase.id,
            notes: "Compra registrada",
            ...(data.invoiceNumber && { referenceNumber: data.invoiceNumber }),
          },
        });

        await tx.productSupplier.upsert({
          where: {
            productId_supplierId: {
              productId: item.productId,
              supplierId: data.supplierId,
            },
          },
          update: { lastCost: new Prisma.Decimal(item.unitCost) },
          create: {
            productId: item.productId,
            supplierId: data.supplierId,
            lastCost: new Prisma.Decimal(item.unitCost),
            isActive: true,
          },
        });
      }

      return tx.purchase.findUniqueOrThrow({
        where: { id: purchase.id },
        select: purchaseDetailSelect,
      });
    });
  }

  private buildListWhere(
    companyId: string,
    query: NormalizedQueryPurchases,
  ): Prisma.PurchaseWhereInput {
    return {
      branch: { companyId },
      ...(query.branchId && { branchId: query.branchId }),
      ...(query.supplierId && { supplierId: query.supplierId }),
      ...((query.dateFrom || query.dateTo) && {
        createdAt: {
          ...(query.dateFrom && { gte: query.dateFrom }),
          ...(query.dateTo && { lte: query.dateTo }),
        },
      }),
    };
  }
}
