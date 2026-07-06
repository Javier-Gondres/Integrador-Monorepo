import { RoleName } from '@repo/db';
import { AuthException } from 'src/common/errors';
import { assertCanManageUser } from 'src/users/helpers/assert-assignable-role';

/**
 * Política de gestión de empleados (editar / eliminar / restaurar).
 *
 * Guía: `docs/employee-user-registration-flow.md` (§8.2) y
 * `docs/permissions-guide.md` (jerarquía de roles).
 *
 * Paridad con `assertCanManageUser` en usuarios; excepciones:
 * - Edición propia permitida (datos laborales).
 * - Owner/Admin no pueden eliminar su propio registro de empleado.
 */
type EmployeeActor = {
  userId: string;
  role: RoleName | null;
};

type EmployeeTarget = {
  userId: string;
  role: RoleName;
};

export function assertCanUpdateEmployee(
  actor: EmployeeActor,
  target: EmployeeTarget,
): void {
  if (actor.userId === target.userId) {
    return;
  }

  assertCanManageUser(actor.role, target.role);
}

export function assertCanDeleteEmployee(
  actor: EmployeeActor,
  target: EmployeeTarget,
): void {
  if (
    actor.userId === target.userId &&
    (actor.role === RoleName.OWNER || actor.role === RoleName.ADMIN)
  ) {
    throw AuthException.unauthorizedCompanyAccess(
      'No puedes eliminar tu propio registro de empleado',
    );
  }

  assertCanManageUser(actor.role, target.role);
}
