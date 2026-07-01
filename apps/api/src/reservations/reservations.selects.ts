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

export const reservationListSelect = {
  id: true,
  status: true,
  expiresAt: true,
  notes: true,
  createdAt: true,
  branch: { select: branchSummarySelect },
  customer: { select: customerSummarySelect },
  _count: { select: { items: true } },
} as const satisfies Prisma.ReservationSelect;

export const reservationDetailSelect = {
  id: true,
  status: true,
  expiresAt: true,
  notes: true,
  createdAt: true,
  branch: { select: branchSummarySelect },
  customer: { select: customerSummarySelect },
  createdBy: {
    select: {
      id: true,
      user: { select: { firstName: true, lastName: true } },
    },
  },
  items: {
    select: {
      id: true,
      quantity: true,
      product: { select: productSummarySelect },
    },
  },
} as const satisfies Prisma.ReservationSelect;

export type ReservationListRecord = Prisma.ReservationGetPayload<{
  select: typeof reservationListSelect;
}>;

export type ReservationDetailRecord = Prisma.ReservationGetPayload<{
  select: typeof reservationDetailSelect;
}>;
