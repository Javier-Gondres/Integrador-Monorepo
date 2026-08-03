import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthException } from 'src/common/errors';

import type { AuthContext } from '../../../auth/auth.types';

/**
 * Autorización de plataforma.
 *
 * No usa CompanyGuard porque el SuperAdmin existe fuera de cualquier tenant.
 * Este guard solo valida el flag de plataforma `isSuperAdmin` presente en el JWT.
 */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const auth = request.auth ?? (request.user as AuthContext | undefined);

    if (!auth?.isSuperAdmin) {
      throw AuthException.unauthorized();
    }

    return true;
  }
}
