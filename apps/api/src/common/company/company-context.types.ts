import type { RoleName } from '@repo/db';

/**
 * Contexto de tenant activo en la petición.
 * Se establece en `request.company` tras JwtAuthGuard + CompanyGuard.
 */
export type CompanyContext = {
  companyId: string;
  branchId: string | null;
  role: RoleName;
};
