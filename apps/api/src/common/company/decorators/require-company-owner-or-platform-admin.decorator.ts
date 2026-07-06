import { applyDecorators, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CompanyOwnerOrPlatformAdminGuard } from '../guards/company-owner-or-platform-admin.guard';

/**
 * Gestión de Company: JWT + OWNER de su empresa o SUPER_ADMIN de plataforma.
 *
 * No usa CompanyGuard ni PermissionGuard. La gestión del tenant principal
 * no forma parte del catálogo RBAC empresarial (companies.*).
 */
export function RequireCompanyOwnerOrPlatformAdmin() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, CompanyOwnerOrPlatformAdminGuard),
  );
}
