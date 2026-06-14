import type { Prisma } from '@repo/db';

const productSummarySelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  price: true,
  isActive: true,
} as const;

export const productSupplierSelect = {
  productId: true,
  supplierId: true,
  isActive: true,
  isPreferred: true,
  lastCost: true,
  createdAt: true,
  updatedAt: true,
  product: {
    select: productSummarySelect,
  },
} as const satisfies Prisma.ProductSupplierSelect;

export type ProductSupplierRecord = Prisma.ProductSupplierGetPayload<{
  select: typeof productSupplierSelect;
}>;
