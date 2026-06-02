import { applyDecorators, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../guards/company.guard';

/**
 * Rutas de tenant: JWT válido + usuario con empresa asignada.
 * Orden: JwtAuthGuard → CompanyGuard.
 */
export function RequireCompany() {
  return applyDecorators(UseGuards(JwtAuthGuard, CompanyGuard));
}
