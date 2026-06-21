import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RoleName } from '@repo/db';
import { Request } from 'express';
import { AuthException } from 'src/common/errors';

import type { AuthContext } from '../../../auth/auth.types';

/**
 * Autorización especial para gestión de Company (fuera del RBAC empresarial).
 * Permite OWNER con membership o SUPER_ADMIN sin membership.
 *
 * No valida company.isActive: OWNER puede reactivar su empresa;
 * SUPER_ADMIN puede administrar empresas suspendidas.
 */
@Injectable()
export class CompanyOwnerOrPlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const auth = request.auth ?? (request.user as AuthContext | undefined);

    if (!auth) {
      throw AuthException.unauthorized();
    }

    if (auth.isSuperAdmin) {
      request.auth = auth;
      return true;
    }

    if (auth.role === RoleName.OWNER && auth.companyId) {
      request.auth = auth;
      return true;
    }

    throw AuthException.unauthorizedCompanyAccess(
      'Solo el OWNER o un administrador de plataforma pueden realizar esta operación',
    );
  }
}
