import { RoleName } from '@repo/db';
import { AuthException } from 'src/common/errors';

const ROLE_RANK: Record<RoleName, number> = {
  [RoleName.OWNER]: 5,
  [RoleName.ADMIN]: 4,
  [RoleName.MANAGER]: 3,
  [RoleName.CASHIER]: 2,
  [RoleName.INVENTORY_ASSISTANT]: 1,
};

const OWNER_ASSIGNABLE: RoleName[] = [
  RoleName.ADMIN,
  RoleName.MANAGER,
  RoleName.CASHIER,
  RoleName.INVENTORY_ASSISTANT,
];

const ADMIN_ASSIGNABLE: RoleName[] = [
  RoleName.MANAGER,
  RoleName.CASHIER,
  RoleName.INVENTORY_ASSISTANT,
];

/**
 * Un actor solo puede administrar usuarios con privilegio estrictamente inferior.
 * Jerarquía: OWNER > ADMIN > MANAGER > CASHIER > INVENTORY_ASSISTANT
 */
export function assertCanManageUser(
  actorRole: RoleName | null,
  targetRole: RoleName,
): void {
  if (!actorRole) {
    throw AuthException.unauthorizedCompanyAccess(
      'No tienes permiso para administrar usuarios',
    );
  }

  const actorRank = ROLE_RANK[actorRole];
  const targetRank = ROLE_RANK[targetRole];

  if (actorRank <= targetRank) {
    throw AuthException.unauthorizedCompanyAccess(
      'No tienes permiso para administrar este usuario',
    );
  }
}

/** Roles que el actor puede asignar vía users.create / users.update / employees.create. */
export function getAssignableRoles(actorRole: RoleName | null): RoleName[] {
  if (actorRole === RoleName.OWNER) {
    return OWNER_ASSIGNABLE;
  }

  if (actorRole === RoleName.ADMIN) {
    return ADMIN_ASSIGNABLE;
  }

  return [];
}

export function assertAssignableRole(
  actorRole: RoleName | null,
  targetRole: RoleName,
): void {
  if (targetRole === RoleName.OWNER) {
    throw AuthException.unauthorizedCompanyAccess(
      'No se puede asignar el rol OWNER',
    );
  }

  const allowed = getAssignableRoles(actorRole);

  if (!allowed.includes(targetRole)) {
    throw AuthException.unauthorizedCompanyAccess(
      'No tienes permiso para asignar este rol',
    );
  }
}
