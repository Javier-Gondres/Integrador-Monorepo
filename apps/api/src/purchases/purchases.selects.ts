import type { Prisma } from '@repo/db';

const supplierSummarySelect = {
  id: true,
  name: true,
  contactName: true,
} as const;

const branchSummarySelect = {
  id: true,
  name: true,
} as const;

export const purchaseListSelect = {
  id: true,
  invoiceNumber: true,
  invoiceDate: true,
  subtotal: true,
  taxAmount: true,
  total: true,
  createdAt: true,
  supplier: { select: supplierSummarySelect },
  branch: { select: branchSummarySelect },
  items: { select: { quantity: true } },
  _count: { select: { items: true } },
} as const satisfies Prisma.PurchaseSelect;

export const purchaseDetailSelect = {
  id: true,
  invoiceNumber: true,
  invoiceDate: true,
  subtotal: true,
  taxAmount: true,
  total: true,
  createdAt: true,
  supplier: { select: supplierSummarySelect },
  branch: { select: branchSummarySelect },
  items: {
    select: {
      id: true,
      quantity: true,
      unitCost: true,
      subtotal: true,
      product: { select: { id: true, code: true, name: true } },
    },
  },
} as const satisfies Prisma.PurchaseSelect;

export type PurchaseListRecord = Prisma.PurchaseGetPayload<{
  select: typeof purchaseListSelect;
}>;

export type PurchaseDetailRecord = Prisma.PurchaseGetPayload<{
  select: typeof purchaseDetailSelect;
}>;
