import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthException } from 'src/common/errors';

import type { AuthContext } from '../../../auth/auth.types';
import type { CompanyContext } from '../company-context.types';
import { assertHasCompanyMembership } from '../helpers/assert-company-access';

function toCompanyContext(auth: AuthContext): CompanyContext {
  // assertHasCompanyMembership ya garantizó companyId y role en membership activa
  return {
    companyId: auth.companyId!,
    branchId: auth.branchId,
    role: auth.role!,
  };
}

/**
 * Requiere JWT previo (JwtAuthGuard) y membership con empresa.
 * Establece `request.company` para decoradores y servicios.
 */
@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const auth = this.resolveAuth(request);

    if (!auth) {
      throw AuthException.unauthorized();
    }

    assertHasCompanyMembership(auth.companyId);

    if (!auth.role) {
      throw AuthException.unauthorizedCompanyAccess(
        'No tienes un rol asignado en esta empresa',
      );
    }

    request.auth = auth;
    request.company = toCompanyContext(auth);

    return true;
  }

  private resolveAuth(request: Request): AuthContext | undefined {
    return request.auth ?? (request.user as AuthContext | undefined);
  }
}
