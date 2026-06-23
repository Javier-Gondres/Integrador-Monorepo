import { AuthException } from 'src/common/errors';

import type { AuthContext, UserAuthContext } from '../../../auth/auth.types';

const SUPER_ADMIN_TENANT_MESSAGE =
  'Los administradores de plataforma no pueden pertenecer a una empresa tenant';

/**
 * Un actor de plataforma (Super Admin) opera fuera del dominio tenant.
 * No puede crear ni mantener membresía `UserCompany`.
 */
export function assertSuperAdminCannotJoinTenant(auth: AuthContext): void {
  if (auth.isSuperAdmin) {
    throw AuthException.unauthorizedCompanyAccess(SUPER_ADMIN_TENANT_MESSAGE);
  }
}

export function assertUserEligibleForTenantMembership(
  isSuperAdmin: boolean,
): void {
  if (isSuperAdmin) {
    throw AuthException.unauthorizedCompanyAccess(SUPER_ADMIN_TENANT_MESSAGE);
  }
}

/**
 * Si existiera membresía inconsistente en BD, el JWT no debe mezclar dominios.
 */
export function stripTenantMembershipForSuperAdmin(
  user: UserAuthContext,
): UserAuthContext {
  if (!user.isSuperAdmin || !user.membership) {
    return user;
  }

  return {
    ...user,
    membership: null,
  };
}
