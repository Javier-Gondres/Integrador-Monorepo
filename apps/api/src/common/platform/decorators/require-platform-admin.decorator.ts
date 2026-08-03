import { applyDecorators, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PlatformAdminGuard } from '../guards/platform-admin.guard';

/**
 * Rutas de plataforma: JWT válido + usuario global SuperAdmin.
 *
 * No incluye CompanyGuard ni PermissionGuard. La autorización de plataforma
 * se mantiene separada del RBAC empresarial.
 */
export function RequirePlatformAdmin() {
  return applyDecorators(UseGuards(JwtAuthGuard, PlatformAdminGuard));
}
