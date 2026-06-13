import type { Prisma } from "@repo/db";

export const inventoryMovementSelect = {
  id: true,
  branchId: true,
  productId: true,
  type: true,
  quantity: true,
  adjustmentReason: true,
  referenceNumber: true,
  notes: true,
  createdAt: true,
  product: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
  performedBy: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
} as const;

export type InventoryMovementRecord = Prisma.InventoryMovementGetPayload<{
  select: typeof inventoryMovementSelect;
}>;
