# Acceso tenant: capas de validación

Referencia humana para la política definida en código en `src/common/tenant-access/tenant-access.policy.ts` y `src/employees/policies/employee-branch.policy.ts`.

---

## Resumen

| Capa     | Componente                         | Pregunta                                 | Bloqueo   |
| -------- | ---------------------------------- | ---------------------------------------- | --------- |
| 0        | `JwtAuthGuard`                     | ¿Usuario autenticado y activo?           | 401       |
| 1        | `CompanyGuard`                     | ¿Empresa activa en BD?                   | 403       |
| 2        | `BranchAccessService`              | ¿Sucursal activa (flujos branch-scoped)? | 403       |
| RBAC     | `PermissionGuard`                  | ¿Permisos en JWT?                        | 403       |
| Empleado | `assertEmployeeForBranchOperation` | ¿Empleado activo en sucursal operativa?  | 403 / 400 |

Las capas son **independientes**. Pasar capa 1 no implica pasar capa 2.

---

## Capa 1 — Empresa (`CompanyGuard`)

**Aplica en:** `@RequireCompany()` y `@RequirePermissions()`.

**Valida:**

- JWT con `companyId` y `role`.
- Consulta BD: `company.isActive === false` → **403** inmediato (vía `CompanyStatusRepository`).

**No aplica en:**

- `@JwtAuth()` — sesión global (`/auth/session`, `/auth/profile`, `/auth/logout`, `/me/company`, etc.).
- `@RequireCompanyOwnerOrPlatformAdmin()` — OWNER puede reactivar su empresa; SUPER_ADMIN gestiona empresas suspendidas.

---

## Capa 2 — Sucursal (`BranchAccessService`)

**Aplica en:** flujos **branch-scoped** que llaman `assertBranchInCompany()` o `resolveBranchId()`.

Ejemplos actuales:

- Caja (`/cash-registers/*`)
- Empleados al filtrar/crear/mover por `branchId`
- `POST /me/switch-branch`

**Valida:**

- La sucursal existe en la empresa del JWT.
- `branch.isActive === false` → **403** inmediato.

**No aplica en:**

- Gestión admin de sucursales (`GET /branches`, `PATCH /branches/:id/activate`).
- Catálogo company-wide (ver capa 3).

---

## Capa 3 — Catálogo company-wide

Módulos cuyos recursos pertenecen a la **empresa**, no a una sucursal concreta:

| Módulo HTTP  | Permisos típicos |
| ------------ | ---------------- |
| `products`   | `products.*`     |
| `categories` | `categories.*`   |
| `customers`  | `customers.*`    |
| `suppliers`  | `suppliers.*`    |
| `discounts`  | `discounts.*`    |

**Regla:** solo requieren capa 1 + RBAC (`@RequirePermissions`). **No** dependen del estado de la sucursal del JWT.

Un usuario con empresa activa y permiso puede gestionar catálogo aunque su `branchId` apunte a una sucursal inactiva.

Constante en código: `TENANT_CATALOG_MODULES` en `src/common/tenant-access/`.

**Futuro:** ventas, compras e inventario por sucursal deben usar capa 2 desde el diseño inicial.

**Implementado (branch-scoped):** inventarios, movimientos de inventario, mermas, transferencias, empleados (filtro/alta por `branchId`), caja.

---

## Política empleado ↔ sucursal

Archivo: `src/employees/policies/employee-branch.policy.ts`.

1. Cada `Employee` pertenece a **una** sucursal (`employee.branchId`).
2. Un usuario tiene como máximo un empleado (`employee.userId` único).
3. Operaciones branch-scoped (p. ej. **apertura de turno**) exigen:
   - empleado existente para el `userId` autenticado;
   - `employee.isActive === true`;
   - `employee.companyId === companyId` del JWT;
   - `employee.branchId === branchId` operativo **salvo** alcance multi-sucursal (`allowCrossBranch` cuando el JWT tiene `branches.read`).
4. `switchBranch` actualiza la sucursal por defecto del JWT; **no** reasigna al empleado. Cajeros siguen limitados a su sucursal; supervisores con `branches.read` pueden abrir/cerrar cajas de otras sucursales de la empresa (la sucursal se toma de la caja, no del JWT).
5. Reasignar empleado a otra sucursal: `PATCH /employees/:id` (HR); sucursal destino debe estar activa (`BranchAccessService`).

### Gestión HR por jerarquía de roles

Archivo: `src/employees/policies/employee-management.policy.ts`.

- Editar/eliminar/restaurar exige rol actor **estrictamente superior** al del empleado objetivo (paridad con usuarios).
- Excepción: cualquier empleado puede **editar su propio** registro laboral.
- Owner y Admin **no pueden eliminar** su propio registro de empleado.

### Apertura / cierre de turno

```text
Usuario autenticado
      ↓
CashRegister by id → assertBranchInCompany(register.branchId, companyId)
      ↓
(open) userId → Employee → assertEmployeeForBranchOperation(
        employee, register.branchId, companyId,
        { allowCrossBranch: permissions.includes('branches.read') })
      ↓
openShift / closeShift
```

## El cliente **no** envía `employeeId`. Cerrar no exige que el JWT apunte a la misma sucursal que la caja.

## RBAC tenant (`PermissionGuard`)

**Aplica en:** `@RequirePermissions('codigo.permiso', ...)`.

**Orden de guards:** `JwtAuthGuard` → `CompanyGuard` → `PermissionGuard`.

Los permisos se leen del **JWT** (`auth.permissions`). El seed define la matriz `RolePermission` por rol.

**Separación plataforma / tenant:**

- `isSuperAdmin` **no** otorga permisos tenant en `PermissionGuard`.
- SuperAdmin opera fuera del tenant (rutas `@RequireCompanyOwnerOrPlatformAdmin()` o futuras `@RequirePlatformAdmin()`).

---

## Jerarquía de roles (usuarios)

Archivo: `src/users/helpers/assert-assignable-role.ts`.

```text
OWNER > ADMIN > MANAGER > CASHIER > INVENTORY_ASSISTANT
```

- Un actor solo administra usuarios con rango **estrictamente inferior**.
- Nadie asigna rol `OWNER` vía API.
- OWNER asigna ADMIN/MANAGER/CASHIER/INVENTORY_ASSISTANT; ADMIN asigna MANAGER/CASHIER/INVENTORY_ASSISTANT.

---

## Matriz de escenarios

| Escenario                                                | Resultado                                         |
| -------------------------------------------------------- | ------------------------------------------------- |
| Empresa activa + sucursal activa + permiso               | Operación permitida                               |
| Empresa inactiva                                         | 403 (`CompanyGuard`)                              |
| Empresa activa + sucursal inactiva + flujo branch-scoped | 403 (`BranchAccessService`)                       |
| Empresa activa + sucursal inactiva + catálogo            | Permitido (capa 3)                                |
| Empresa inactiva + OWNER reactiva empresa                | Permitido (`@RequireCompanyOwnerOrPlatformAdmin`) |
| Usuario desactivado                                      | 401 (`JwtStrategy`, revalida BD)                  |
| Permisos revocados en BD                                 | Puede persistir hasta expiración JWT (~15 min)    |

---

## Archivos clave

| Tema                        | Ruta                                                |
| --------------------------- | --------------------------------------------------- |
| Política capas (código)     | `src/common/tenant-access/tenant-access.policy.ts`  |
| Barrel export               | `src/common/tenant-access/index.ts`                 |
| Empleado ↔ sucursal         | `src/employees/policies/employee-branch.policy.ts`  |
| CompanyGuard                | `src/common/company/guards/company.guard.ts`        |
| BranchAccessService         | `src/branch/branch-access.service.ts`               |
| PermissionGuard             | `src/common/permissions/guards/permission.guard.ts` |
| Auth y guards (guía amplia) | `apps/api/docs/auth-and-utilities.md`               |
