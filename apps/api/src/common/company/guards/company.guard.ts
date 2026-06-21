import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthException } from 'src/common/errors';

import type { AuthContext } from '../../../auth/auth.types';
import { CompanyStatusRepository } from '../company-status.repository';
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
 * Requiere JWT previo (JwtAuthGuard) y membership con empresa activa.
 * Rechaza operaciones tenant si la empresa está inactiva (isActive = false).
 *
 * Capa 1 de acceso tenant. Ver `common/tenant-access/tenant-access.policy.ts`.
 *
 * No aplica a @RequireCompanyOwnerOrPlatformAdmin(): OWNER y SUPER_ADMIN
 * pueden gestionar empresas inactivas (p. ej. reactivación).
 */
@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(
    private readonly companyStatusRepository: CompanyStatusRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    const isActive = await this.companyStatusRepository.isCompanyActive(
      auth.companyId!,
    );

    if (!isActive) {
      throw AuthException.unauthorizedCompanyAccess(
        'La empresa está inactiva. No puedes realizar operaciones en este momento.',
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
