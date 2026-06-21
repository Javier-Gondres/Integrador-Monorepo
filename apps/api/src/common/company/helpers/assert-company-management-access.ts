import { RoleName } from '@repo/db';
import { AuthException } from 'src/common/errors';

import type { AuthContext } from '../../../auth/auth.types';
import { assertCompanyAccess } from './assert-company-access';

/**
 * Gestión de Company: capacidad especial fuera del catálogo RBAC empresarial.
 * Permitido para OWNER (su propia empresa) o SUPER_ADMIN (cualquier empresa).
 */
export function assertCanManageCompany(auth: AuthContext): void {
  if (auth.isSuperAdmin) {
    return;
  }

  if (auth.role === RoleName.OWNER && auth.companyId) {
    return;
  }

  throw AuthException.unauthorizedCompanyAccess(
    'Solo el OWNER o un administrador de plataforma pueden realizar esta operación',
  );
}

/**
 * OWNER solo accede a su empresa; SUPER_ADMIN accede a cualquier empresa.
 */
export function assertCompanyAccessOrPlatformAdmin(
  resourceCompanyId: string | null | undefined,
  auth: AuthContext,
): void {
  if (auth.isSuperAdmin) {
    return;
  }

  assertCompanyAccess(resourceCompanyId, auth.companyId);
}
