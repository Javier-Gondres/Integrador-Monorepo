import {
  AuthException,
  BusinessException,
  ErrorCodes,
} from 'src/common/errors';

/**
 * Política empleado ↔ sucursal
 *
 * Guía ampliada: `apps/api/docs/tenant-access.md` (sección empleado ↔ sucursal).
 *
 * 1. Cada `Employee` pertenece a **una** sucursal (`employee.branchId`) dentro de su empresa.
 * 2. Un usuario autenticado tiene como máximo un empleado (`employee.userId`).
 * 3. Flujos operativos branch-scoped (p. ej. apertura de turno en caja) exigen:
 *    - empleado existente para el `userId` autenticado;
 *    - `employee.isActive === true`;
 *    - `employee.companyId === companyId` del JWT;
 *    - `employee.branchId === branchId` operativo (sucursal de la caja / contexto),
 *      salvo usuarios con alcance multi-sucursal (`allowCrossBranch`, p. ej. `branches.read`).
 * 4. `switchBranch` actualiza la sucursal por defecto del JWT, pero **no** reasigna
 *    al empleado. Los cajeros siguen limitados a su sucursal; supervisores con
 *    `branches.read` pueden operar cajas de otras sucursales de la empresa.
 * 5. Reasignar un empleado a otra sucursal es gestión HR (`employees.update`) y exige
 *    sucursal destino activa vía `BranchAccessService`.
 */

export type EmployeeOperationalContext = {
  id: string;
  companyId: string;
  branchId: string;
  isActive: boolean;
};

export type AssertEmployeeForBranchOptions = {
  /**
   * Si true, no exige `employee.branchId === branchId`.
   * Usar cuando el actor tiene alcance multi-sucursal (p. ej. `branches.read`).
   */
  allowCrossBranch?: boolean;
};

/** Valida que el empleado del usuario pueda operar en la sucursal indicada. */
export function assertEmployeeForBranchOperation(
  employee: EmployeeOperationalContext | null | undefined,
  branchId: string,
  companyId: string,
  options?: AssertEmployeeForBranchOptions,
): EmployeeOperationalContext {
  if (!employee) {
    throw new BusinessException(
      ErrorCodes.VALIDATION_ERROR,
      'El usuario actual no tiene un empleado asociado.',
    );
  }

  if (employee.companyId !== companyId) {
    throw AuthException.unauthorizedCompanyAccess(
      'El empleado no pertenece a esta empresa',
    );
  }

  if (!employee.isActive) {
    throw new BusinessException(
      ErrorCodes.VALIDATION_ERROR,
      'El empleado asociado está inactivo.',
    );
  }

  if (!options?.allowCrossBranch && employee.branchId !== branchId) {
    throw AuthException.unauthorizedCompanyAccess(
      'Solo puedes operar en la sucursal asignada a tu empleado.',
    );
  }

  return employee;
}
