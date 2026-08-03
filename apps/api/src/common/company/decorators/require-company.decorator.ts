import { applyDecorators, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../guards/company.guard';

/**
 * Rutas de tenant: JWT válido + usuario con empresa asignada y activa.
 * Orden: JwtAuthGuard → CompanyGuard.
 *
 * CompanyGuard (capa 1) rechaza empresas inactivas con 403.
 * Ver `common/tenant-access/tenant-access.policy.ts`.
 *
 * La gestión de empresa inactiva usa @RequireCompanyOwnerOrPlatformAdmin().
 */
export function RequireCompany() {
  return applyDecorators(UseGuards(JwtAuthGuard, CompanyGuard));
}
