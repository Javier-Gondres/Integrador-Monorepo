import type { Prisma } from '@repo/db';

const productSummarySelect = {
  id: true,
  name: true,
  code: true,
} as const;

const categorySummarySelect = {
  id: true,
  name: true,
} as const;

export const discountSelect = {
  id: true,
  companyId: true,
  name: true,
  description: true,
  percentage: true,
  startDate: true,
  endDate: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  products: {
    select: productSummarySelect,
  },
  categories: {
    select: categorySummarySelect,
  },
  excludedProducts: {
    select: {
      id: true,
      product: {
        select: productSummarySelect,
      },
    },
  },
} as const;

export type DiscountRecord = Prisma.DiscountGetPayload<{
  select: typeof discountSelect;
}>;
