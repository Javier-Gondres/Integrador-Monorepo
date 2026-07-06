import { TenantRole, type TenantRoleName } from "@repo/shared";

import { canManageTargetRole } from "@/shared/auth/role-hierarchy";

export { canManageTargetRole };

const ROLE_LABELS: Record<TenantRoleName, string> = {
  [TenantRole.OWNER]: "Propietario",
  [TenantRole.ADMIN]: "Administrador",
  [TenantRole.MANAGER]: "Gerente",
  [TenantRole.CASHIER]: "Cajero",
  [TenantRole.INVENTORY_ASSISTANT]: "Inventario",
};

export function getRoleLabel(roleName: string | undefined | null): string {
  if (!roleName) {
    return "—";
  }
  return ROLE_LABELS[roleName as TenantRoleName] ?? roleName;
}
