import type { Prisma } from '@repo/db';

const categorySummarySelect = {
  id: true,
  name: true,
} as const;

export const productSelect = {
  id: true,
  companyId: true,
  name: true,
  code: true,
  description: true,
  imageUrl: true,
  price: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  categories: {
    select: categorySummarySelect,
  },
} as const;

export type ProductRecord = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;
