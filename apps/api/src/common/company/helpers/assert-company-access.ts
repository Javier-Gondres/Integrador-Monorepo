import { AuthException } from 'src/common/errors';

/**
 * Verifica que el usuario tenga empresa asignada (membership).
 * Útil antes de operaciones de tenant.
 */
export function assertHasCompanyMembership(
  currentCompanyId: string | null | undefined,
): asserts currentCompanyId is string {
  if (!currentCompanyId) {
    throw AuthException.unauthorizedCompanyAccess(
      'No tienes una empresa asignada',
    );
  }
}

/**
 * Impide acceso cross-tenant: el recurso debe pertenecer a la empresa del JWT.
 *
 * @example
 * const order = await prisma.order.findUnique({ where: { id } });
 * assertCompanyAccess(order?.companyId, auth.companyId);
 */
export function assertCompanyAccess(
  resourceCompanyId: string | null | undefined,
  currentCompanyId: string | null | undefined,
): void {
  assertHasCompanyMembership(currentCompanyId);

  if (!resourceCompanyId || resourceCompanyId !== currentCompanyId) {
    throw AuthException.unauthorizedCompanyAccess();
  }
}
