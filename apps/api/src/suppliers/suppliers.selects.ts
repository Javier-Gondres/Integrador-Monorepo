import type { Prisma } from '@repo/db';

export const supplierSelect = {
  id: true,
  companyId: true,
  name: true,
  contactName: true,
  email: true,
  phone: true,
  rnc: true,
  address: true,
  notes: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { products: true },
  },
} satisfies Prisma.SupplierSelect;

export type SupplierRecord = Prisma.SupplierGetPayload<{
  select: typeof supplierSelect;
}>;
