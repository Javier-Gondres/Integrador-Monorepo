import { applyDecorators, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/** Rutas que requieren JWT sin tenant activo (onboarding, /me parcial). */
export function JwtAuth() {
  return applyDecorators(UseGuards(JwtAuthGuard));
}
