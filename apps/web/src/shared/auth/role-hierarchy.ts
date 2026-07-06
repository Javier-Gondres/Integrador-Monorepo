import { TenantRole, type TenantRoleName } from "@repo/shared";

/**
 * Jerarquía de roles tenant para la UI.
 * Paridad con `assertCanManageUser` / `assert-assignable-role.ts` del API.
 */
const ROLE_RANK: Record<TenantRoleName, number> = {
  [TenantRole.OWNER]: 5,
  [TenantRole.ADMIN]: 4,
  [TenantRole.MANAGER]: 3,
  [TenantRole.CASHIER]: 2,
  [TenantRole.INVENTORY_ASSISTANT]: 1,
};

export function canManageTargetRole(
  actorRole: string | undefined | null,
  targetRole: string | undefined | null,
): boolean {
  if (!actorRole || !targetRole) {
    return false;
  }

  const actorRank = ROLE_RANK[actorRole as TenantRoleName];
  const targetRank = ROLE_RANK[targetRole as TenantRoleName];

  if (actorRank === undefined || targetRank === undefined) {
    return false;
  }

  return actorRank > targetRank;
}
