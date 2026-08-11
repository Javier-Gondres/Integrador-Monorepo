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

/** Datos fiscales del cliente para la Representación Impresa / factura. */
const customerFiscalSelect = {
  id: true,
  firstName: true,
  lastName: true,
  rnc: true,
  cedula: true,
  address: true,
  phone: true,
} as const;

/** Emisor (sucursal + empresa) para el encabezado de la factura impresa. */
const branchFiscalSelect = {
  id: true,
  name: true,
  address: true,
  company: {
    select: {
      name: true,
      rnc: true,
      address: true,
      phone: true,
      email: true,
    },
  },
} as const;

const productSummarySelect = {
  id: true,
  code: true,
  name: true,
} as const;

export const saleListSelect = {
  id: true,
  ncf: true,
  ncfType: true,
  status: true,
  subtotal: true,
  taxAmount: true,
  total: true,
  createdAt: true,
  branch: { select: branchSummarySelect },
  customer: { select: customerSummarySelect },
  cashier: {
    select: {
      id: true,
      user: { select: { firstName: true, lastName: true } },
    },
  },
  cashShift: {
    select: { cashRegister: { select: { id: true, name: true } } },
  },
  // El total de la venta se guarda bruto (la nota de crédito es un documento
  // fiscal aparte); se traen los montos redimidos para poder mostrar el neto.
  redeemedCreditNotes: { select: { amount: true } },
  _count: { select: { items: true } },
} as const satisfies Prisma.SaleSelect;

export const saleDetailSelect = {
  id: true,
  ncf: true,
  ncfType: true,
  status: true,
  subtotal: true,
  taxAmount: true,
  total: true,
  createdAt: true,
  reservationId: true,
  branch: { select: branchFiscalSelect },
  customer: { select: customerFiscalSelect },
  cashier: {
    select: {
      id: true,
      user: { select: { firstName: true, lastName: true } },
    },
  },
  items: {
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      discountPercentage: true,
      discountAmount: true,
      subtotal: true,
      product: { select: productSummarySelect },
    },
  },
  payments: {
    select: { id: true, method: true, amount: true },
  },
  redeemedCreditNotes: {
    select: { id: true, ncf: true, amount: true },
  },
  accountReceivable: {
    select: { id: true, balance: true, dueDate: true, status: true },
  },
} as const satisfies Prisma.SaleSelect;

/** Notas de crédito activas disponibles para redimir en una venta. */
export const creditNoteForSaleSelect = {
  id: true,
  ncf: true,
  ncfType: true,
  amount: true,
  createdAt: true,
} as const satisfies Prisma.CreditNoteSelect;

export type SaleListRecord = Prisma.SaleGetPayload<{
  select: typeof saleListSelect;
}>;

export type SaleDetailRecord = Prisma.SaleGetPayload<{
  select: typeof saleDetailSelect;
}>;

export type CreditNoteForSaleRecord = Prisma.CreditNoteGetPayload<{
  select: typeof creditNoteForSaleSelect;
}>;
