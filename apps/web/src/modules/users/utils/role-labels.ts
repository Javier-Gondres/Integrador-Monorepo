import { TenantRole, type TenantRoleName } from "@repo/shared";

const ROLE_LABELS: Record<TenantRoleName, string> = {
  [TenantRole.OWNER]: "Propietario",
  [TenantRole.ADMIN]: "Administrador",
  [TenantRole.MANAGER]: "Gerente",
  [TenantRole.CASHIER]: "Cajero",
  [TenantRole.INVENTORY_ASSISTANT]: "Inventario",
};

const ROLE_RANK: Record<TenantRoleName, number> = {
  [TenantRole.OWNER]: 5,
  [TenantRole.ADMIN]: 4,
  [TenantRole.MANAGER]: 3,
  [TenantRole.CASHIER]: 2,
  [TenantRole.INVENTORY_ASSISTANT]: 1,
};

export function getRoleLabel(roleName: string | undefined | null): string {
  if (!roleName) {
    return "—";
  }
  return ROLE_LABELS[roleName as TenantRoleName] ?? roleName;
}

/** Paridad UI con `assertCanManageUser` del API. */
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
