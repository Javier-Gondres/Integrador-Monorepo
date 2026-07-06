import { TenantRole, type TenantRoleName } from "@repo/shared";

import { canManageTargetRole } from "@/shared/auth/role-hierarchy";

import type { Employee } from "../types/employee.types";

/** Paridad UI con políticas de `employee-management.policy` del API. */
export function canEditEmployee(
  actorUserId: string | undefined,
  actorRole: string | undefined | null,
  employee: Employee,
): boolean {
  if (!actorUserId || !actorRole || !employee.roleName) {
    return false;
  }

  if (actorUserId === employee.userId) {
    return true;
  }

  return canManageTargetRole(actorRole, employee.roleName);
}

export function canDeleteEmployee(
  actorUserId: string | undefined,
  actorRole: string | undefined | null,
  employee: Employee,
): boolean {
  if (!actorUserId || !actorRole || !employee.roleName) {
    return false;
  }

  if (
    actorUserId === employee.userId &&
    (actorRole === TenantRole.OWNER || actorRole === TenantRole.ADMIN)
  ) {
    return false;
  }

  return canManageTargetRole(actorRole, employee.roleName);
}

export function resolveEmployeeRoleName(
  companyId: string,
  memberships: Array<{ companyId: string; role: { name: string } }>,
): TenantRoleName | null {
  const membership = memberships.find((item) => item.companyId === companyId);
  const roleName = membership?.role.name;

  if (!roleName) {
    return null;
  }

  return roleName as TenantRoleName;
}
