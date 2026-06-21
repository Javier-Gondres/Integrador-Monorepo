/**
 * Roles de tenant (empresa). Los valores coinciden con `RoleName` de Prisma.
 */
export const TenantRole = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CASHIER: "CASHIER",
  INVENTORY_ASSISTANT: "INVENTORY_ASSISTANT",
} as const;

export type TenantRoleName = (typeof TenantRole)[keyof typeof TenantRole];
