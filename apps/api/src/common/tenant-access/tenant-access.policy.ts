/**
 * Política de acceso tenant — capas de validación
 *
 * Guía ampliada para humanos: `apps/api/docs/tenant-access.md`
 *
 * El acceso operativo se valida en capas independientes. Cada capa responde
 * a una pregunta distinta; no se sustituyen entre sí.
 *
 * ---
 *
 * ## Capa 1 — Empresa (`CompanyGuard`)
 *
 * Aplica en rutas `@RequireCompany()` y `@RequirePermissions()`.
 *
 * - Requiere JWT con `companyId` y rol.
 * - Consulta BD: `company.isActive === false` → **403** inmediato.
 * - No aplica en `@JwtAuth()` (sesión) ni en `@RequireCompanyOwnerOrPlatformAdmin()`
 *   (OWNER puede reactivar; SUPER_ADMIN gestiona empresas suspendidas).
 *
 * ---
 *
 * ## Capa 2 — Sucursal (`BranchAccessService`)
 *
 * Aplica en flujos **branch-scoped** (caja, empleados por sucursal, `switchBranch`, etc.).
 *
 * - Valida que la sucursal exista en la empresa del JWT.
 * - Valida `branch.isActive === false` → **403** inmediato.
 * - No aplica en gestión de sucursales (`GET/PATCH /branches/:id/activate`) ni en
 *   consultas administrativas que listen sucursales inactivas para reactivarlas.
 *
 * ---
 *
 * ## Capa 3 — Catálogo company-wide
 *
 * Módulos de maestros compartidos por toda la empresa. Operan solo con `companyId`
 * del JWT; **no dependen del estado de la sucursal** seleccionada en el token.
 *
 * Mientras la **empresa** esté activa y el usuario tenga permiso RBAC, puede
 * gestionar catálogo aunque su `branchId` del JWT apunte a una sucursal inactiva
 * (o distinta a su empleado asignado).
 *
 * Módulos actuales: products, categories, customers, suppliers, discounts.
 *
 * Los flujos operativos futuros por sucursal (ventas, compras, movimientos de
 * inventario) deben usar `BranchAccessService` y la política empleado ↔ sucursal.
 *
 * ---
 *
 * ## Empleado ↔ sucursal
 *
 * Ver `employees/policies/employee-branch.policy.ts`.
 */

/** Módulos HTTP cuyos recursos son company-wide (no branch-scoped). */
export const TENANT_CATALOG_MODULES = [
  'products',
  'categories',
  'customers',
  'suppliers',
  'discounts',
] as const;

export type TenantCatalogModule = (typeof TENANT_CATALOG_MODULES)[number];
