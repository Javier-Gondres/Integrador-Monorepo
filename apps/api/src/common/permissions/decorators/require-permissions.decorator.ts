import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../../company/guards/company.guard';
import { PermissionGuard } from '../guards/permission.guard';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Rutas de tenant con control granular de permisos.
 * Orden: JwtAuthGuard → CompanyGuard → PermissionGuard.
 *
 * - CompanyGuard (capa 1): rechaza empresas inactivas (403).
 * - Flujos branch-scoped deben además usar BranchAccessService (capa 2).
 * - Catálogo company-wide no depende del estado de la sucursal; ver
 *   `common/tenant-access/tenant-access.policy.ts`.
 */
export function RequirePermissions(...permissions: string[]) {
  return applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard),
  );
}
