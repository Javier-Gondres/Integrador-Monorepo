import { TenantRole, type TenantRoleName } from "@repo/shared";

/** Paridad con `getAssignableRoles` del API (`assert-assignable-role.ts`). */
const OWNER_ASSIGNABLE: TenantRoleName[] = [
  TenantRole.ADMIN,
  TenantRole.MANAGER,
  TenantRole.CASHIER,
  TenantRole.INVENTORY_ASSISTANT,
];

const ADMIN_ASSIGNABLE: TenantRoleName[] = [
  TenantRole.MANAGER,
  TenantRole.CASHIER,
  TenantRole.INVENTORY_ASSISTANT,
];

export function getAssignableRoles(
  actorRole: string | null | undefined,
): TenantRoleName[] {
  if (actorRole === TenantRole.OWNER) {
    return OWNER_ASSIGNABLE;
  }

  if (actorRole === TenantRole.ADMIN) {
    return ADMIN_ASSIGNABLE;
  }

  return [];
}

export function canAssignRole(
  actorRole: string | null | undefined,
  targetRole: string,
): boolean {
  return getAssignableRoles(actorRole).includes(targetRole as TenantRoleName);
}

export function filterAssignableRoleOptions<
  T extends { id: string; name: string },
>(roles: T[], actorRole: string | null | undefined): T[] {
  const assignable = new Set(getAssignableRoles(actorRole));
  return roles.filter((role) => assignable.has(role.name as TenantRoleName));
}
