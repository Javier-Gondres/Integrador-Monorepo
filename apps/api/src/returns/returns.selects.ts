import type { Prisma } from '@repo/db';

const branchSummarySelect = {
  id: true,
  name: true,
} as const;

const customerSummarySelect = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

const productSummarySelect = {
  id: true,
  code: true,
  name: true,
} as const;

const creditNoteSummarySelect = {
  id: true,
  ncf: true,
  ncfType: true,
  amount: true,
} as const;

export const returnListSelect = {
  id: true,
  reason: true,
  subtotal: true,
  total: true,
  createdAt: true,
  branch: { select: branchSummarySelect },
  sale: {
    select: {
      id: true,
      ncf: true,
      customer: { select: customerSummarySelect },
    },
  },
  creditNotes: { select: creditNoteSummarySelect },
  _count: { select: { items: true } },
} as const satisfies Prisma.ReturnSelect;

export const returnDetailSelect = {
  id: true,
  reason: true,
  notes: true,
  subtotal: true,
  total: true,
  createdAt: true,
  branch: { select: branchSummarySelect },
  sale: {
    select: {
      id: true,
      ncf: true,
      customer: { select: customerSummarySelect },
    },
  },
  creditNotes: { select: creditNoteSummarySelect },
  items: {
    select: {
      id: true,
      quantity: true,
      subtotal: true,
      product: { select: productSummarySelect },
    },
  },
} as const satisfies Prisma.ReturnSelect;

/** Datos de la venta requeridos para registrar una devolución por NCF. */
export const saleLookupSelect = {
  id: true,
  ncf: true,
  ncfType: true,
  status: true,
  total: true,
  createdAt: true,
  customerId: true,
  branchId: true,
  branch: { select: branchSummarySelect },
  customer: { select: customerSummarySelect },
  items: {
    select: {
      id: true,
      productId: true,
      quantity: true,
      unitPrice: true,
      subtotal: true,
      product: { select: productSummarySelect },
    },
  },
  returns: {
    select: {
      items: { select: { productId: true, quantity: true } },
    },
  },
} as const satisfies Prisma.SaleSelect;

export type ReturnListRecord = Prisma.ReturnGetPayload<{
  select: typeof returnListSelect;
}>;

export type ReturnDetailRecord = Prisma.ReturnGetPayload<{
  select: typeof returnDetailSelect;
}>;

export type SaleLookupRecord = Prisma.SaleGetPayload<{
  select: typeof saleLookupSelect;
}>;
