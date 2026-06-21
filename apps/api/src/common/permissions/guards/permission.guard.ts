import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthException } from 'src/common/errors';

import type { PermissionCode } from '@repo/shared';
import type { AuthContext } from '../../../auth/auth.types';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

/**
 * Verifica que el usuario posea los permisos requeridos (RBAC de tenant).
 *
 * Debe ejecutarse después de JwtAuthGuard y CompanyGuard.
 * El decorador @RequirePermissions() garantiza ese orden.
 *
 * Separación de autorización:
 * - Endpoints de tenant  → @RequirePermissions() = JwtAuthGuard + CompanyGuard + PermissionGuard
 * - Endpoints de plataforma (SuperAdmin) → @JwtAuth() + SuperAdminGuard (a implementar en el futuro)
 *
 * El SuperAdmin no utiliza endpoints de tenant y por tanto nunca llega a este guard
 * (CompanyGuard lo bloquearía al no tener empresa). No se hace bypass aquí.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionCode[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const auth = request.auth ?? (request.user as AuthContext | undefined);

    if (!auth) {
      throw AuthException.unauthorized();
    }

    const hasAll = required.every((p) => auth.permissions.includes(p));

    if (!hasAll) {
      throw AuthException.unauthorizedCompanyAccess(
        'No tienes permisos para realizar esta acción',
      );
    }

    return true;
  }
}
