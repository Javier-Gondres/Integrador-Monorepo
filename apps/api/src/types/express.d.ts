import { AuthContext } from '../auth/auth.types';
import { CompanyContext } from '../common/company/company-context.types';

declare global {
  namespace Express {
    interface Request {
      /** Usuario autenticado (Passport JWT → JwtAuthGuard). */
      user?: AuthContext;
      /** Mismo contexto que `user`; alias estable para servicios. */
      auth?: AuthContext;
      /** Tenant activo; solo tras `CompanyGuard`. */
      company?: CompanyContext;
      /** Identificador único de la petición para correlación/logs. */
      requestId?: string;
    }
  }
}

export {};
