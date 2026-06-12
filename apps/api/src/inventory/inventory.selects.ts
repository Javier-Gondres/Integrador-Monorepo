import type { Prisma } from "@repo/db";

export const inventorySelect = {
  id: true,
  branchId: true,
  productId: true,
  quantity: true,
  minimumQuantity: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  product: {
    select: {
      id: true,
      code: true,
      name: true,
      price: true,
      isActive: true,
    },
  },
} as const;

export type InventoryRecord = Prisma.InventoryGetPayload<{
  select: typeof inventorySelect;
}>;
