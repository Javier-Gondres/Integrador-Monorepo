# Guía de permisos RBAC (API + Web)

Documentación práctica para usar el sistema de autorización del monorepo: catálogo de permisos, guards en NestJS, hooks y componentes en Next.js, sidebar, protección de rutas y bloqueo de acciones en UI.

**Documentos relacionados:**

- [`apps/api/docs/auth-and-utilities.md`](../apps/api/docs/auth-and-utilities.md) — auth, guards y decorators (referencia API)
- [`apps/api/docs/tenant-access.md`](../apps/api/docs/tenant-access.md) — capas tenant y sucursal
- [`apps/web/ARCHITECTURE.md`](../apps/web/ARCHITECTURE.md) — §18 Autenticación y RBAC
- [`docs/security-rbac-critical-review.md`](security-rbac-critical-review.md) — riesgos conocidos y checklist de remediación
- [`packages/shared/src/auth/permissions.ts`](../packages/shared/src/auth/permissions.ts) — catálogo único de códigos
- [`packages/shared/src/auth/permission-matrix.ts`](../packages/shared/src/auth/permission-matrix.ts) — matriz rol → permisos (seed)

---

## Tabla de contenidos

1. [Principios](#1-principios)
2. [Catálogo y roles (`@repo/shared`)](#2-catálogo-y-roles-reposhared)
3. [Flujo de permisos (JWT)](#3-flujo-de-permisos-jwt)
4. [API — proteger endpoints](#4-api--proteger-endpoints)
5. [Web — hook y componentes](#5-web--hook-y-componentes)
6. [Web — sidebar y navegación](#6-web--sidebar-y-navegación)
7. [Web — proteger rutas](#7-web--proteger-rutas)
8. [Web — bloquear acciones en pantallas](#8-web--bloquear-acciones-en-pantallas)
9. [Plataforma vs tenant](#9-plataforma-vs-tenant)
10. [Checklist: nuevo módulo CRUD](#10-checklist-nuevo-módulo-crud)
11. [Errores frecuentes](#11-errores-frecuentes)

---

## 1. Principios

| Regla                      | Detalle                                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Fuente única**           | Todos los códigos viven en `@repo/shared` como `Permission.*`. Nunca uses strings sueltos (`"products.read"`).                |
| **Backend = autoridad**    | La web solo oculta UI y redirige. Un usuario puede llamar la API directamente; el guard debe rechazarlo.                      |
| **Dos sistemas separados** | RBAC tenant (`Permission.*`, `can()`) y admin de plataforma (`isSuperAdmin`) **no se mezclan**.                               |
| **Super Admin sin tenant** | No tiene `companyId` ni `permissions` tenant en el JWT. Usa rutas `/platform/*`, no `@RequirePermissions()`.                  |
| **Permisos en JWT**        | Se resuelven en login/refresh/switch-branch. Cambios de rol en BD tardan hasta ~15 min (vida del access token) salvo refresh. |

### Dos capas de autorización

```
┌─────────────────────────────────────────────────────────────┐
│  PLATAFORMA (SaaS)          │  TENANT (empresa)             │
│  isSuperAdmin               │  Permission.* en JWT          │
│  @RequirePlatformAdmin()    │  @RequirePermissions()        │
│  PlatformGuard (web)        │  PermissionGuard + can()      │
│  /platform/*                │  /products, /users, …         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Catálogo y roles (`@repo/shared`)

### Permisos

Importar siempre desde el paquete compartido:

```typescript
import { Permission, type PermissionCode } from "@repo/shared";
```

Convención de códigos: `dominio.accion` (ej. `products.read`, `users.delete`).

Dominios actuales: `users`, `employees`, `products`, `categories`, `discounts`, `customers`, `suppliers`, `inventory`, `sales`, `receivables`, `payables`, `purchases`, `cash`, `branches`, `reports`.

Acciones típicas por dominio: `create`, `read`, `update`, `delete`, más acciones específicas (`users.activate`, `cash.open`, `inventory.adjust`, `sales.backdate`, `receivables.pay`, `payables.pay`, etc.).

#### Ventas (`sales`)

| Código           | Constante        | Descripción                                                   | Roles (matriz)                 |
| ---------------- | ---------------- | ------------------------------------------------------------- | ------------------------------ |
| `sales.create`   | `SALES_CREATE`   | Registrar ventas (POS / facturación)                          | OWNER, ADMIN, MANAGER, CASHIER |
| `sales.read`     | `SALES_READ`     | Ver ventas / historial                                        | OWNER, ADMIN, MANAGER, CASHIER |
| `sales.cancel`   | `SALES_CANCEL`   | Cancelar ventas / devoluciones                                | OWNER, ADMIN, MANAGER          |
| `sales.backdate` | `SALES_BACKDATE` | Registrar ventas con fecha pasada (`soldAt` en `POST /sales`) | OWNER, ADMIN                   |

#### Cuentas por cobrar (`receivables`)

| Código             | Constante          | Descripción                  | Roles (matriz)                 |
| ------------------ | ------------------ | ---------------------------- | ------------------------------ |
| `receivables.read` | `RECEIVABLES_READ` | Ver CxC / saldos por cliente | OWNER, ADMIN, MANAGER, CASHIER |
| `receivables.pay`  | `RECEIVABLES_PAY`  | Registrar abonos             | OWNER, ADMIN, MANAGER          |

#### Cuentas por pagar (`payables`)

| Código            | Constante         | Descripción                           | Roles (matriz)        |
| ----------------- | ----------------- | ------------------------------------- | --------------------- |
| `payables.read`   | `PAYABLES_READ`   | Ver CxP / listado y detalle           | OWNER, ADMIN, MANAGER |
| `payables.pay`    | `PAYABLES_PAY`    | Registrar abonos a proveedores        | OWNER, ADMIN, MANAGER |
| `payables.update` | `PAYABLES_UPDATE` | Actualizar CxP (fecha de vencimiento) | OWNER, ADMIN, MANAGER |

Tras añadir un permiso al catálogo o a la matriz, re-ejecutar el seed (`packages/database/prisma/seed.ts`) para upsert en BD y pedir refresh/relogin (el JWT cachea permisos hasta ~15 min).

### Roles tenant

```typescript
import { TenantRole, type TenantRoleName } from "@repo/shared";
```

Roles: `OWNER`, `ADMIN`, `MANAGER`, `CASHIER`, `INVENTORY_ASSISTANT`.

La asignación rol → permisos está en `ROLE_PERMISSION_MATRIX` (usada por el seed de BD). **Los guards validan permisos concretos**, no el nombre del rol — excepto flujos explícitos de OWNER (`@RequireCompanyOwnerOrPlatformAdmin`).

---

## 3. Flujo de permisos (JWT)

```
Login / Refresh / Switch-branch
        │
        ▼
  findAuthContext (BD)
  RolePermission → permission.code[]
        │
        ▼
  buildAccessTokenClaims()
        │
        ▼
  Access token JWT
  { permissions, role, companyId, branchId, isSuperAdmin }
        │
        ├─► API: JwtStrategy → request.auth.permissions
        │
        └─► Web: GET /auth/session → AuthUser.permissions → usePermissions()
```

**Archivos clave:**

| Capa       | Archivo                                         |
| ---------- | ----------------------------------------------- |
| Claims     | `apps/api/src/auth/auth.service.ts`             |
| Payload    | `apps/api/src/auth/auth.types.ts`               |
| Sesión web | `apps/web/src/modules/auth/api/get-session.ts`  |
| Store      | `apps/web/src/modules/auth/store/auth-store.ts` |

---

## 4. API — proteger endpoints

### Matriz de decoradores

| Escenario                   | Decorador                               | Guards                            |
| --------------------------- | --------------------------------------- | --------------------------------- |
| CRUD tenant con permiso     | `@RequirePermissions(Permission.X)`     | JWT → Company → Permission        |
| Tenant sin permiso granular | `@RequireCompany()`                     | JWT → Company                     |
| Gestión de empresa (OWNER)  | `@RequireCompanyOwnerOrPlatformAdmin()` | JWT → CompanyOwnerOrPlatformAdmin |
| Admin SaaS `/platform/*`    | `@RequirePlatformAdmin()`               | JWT → PlatformAdmin               |
| Solo autenticado            | `@JwtAuth()`                            | JWT                               |

### `@RequirePermissions` — patrón estándar

```typescript
import { Permission } from "@repo/shared";
import { CompanyId } from "src/common/company";
import { RequirePermissions } from "src/common/permissions";

@Controller("products")
export class ProductsController {
  @RequirePermissions(Permission.PRODUCTS_READ)
  @Get()
  findAll(@CompanyId() companyId: string) { ... }

  @RequirePermissions(Permission.PRODUCTS_CREATE)
  @Post()
  create(@Body() dto: CreateProductDto, @CompanyId() companyId: string) { ... }

  @RequirePermissions(Permission.PRODUCTS_UPDATE)
  @Patch(":id")
  update(@Param("id") id: string, @CompanyId() companyId: string) { ... }

  @RequirePermissions(Permission.PRODUCTS_DELETE)
  @Delete(":id")
  remove(@Param("id") id: string, @CompanyId() companyId: string) { ... }
}
```

- `@CompanyId()` y `@Company()` requieren que `CompanyGuard` haya corrido (lo incluye `@RequirePermissions`).
- Varios permisos en un mismo handler: **todos** deben estar presentes (`required.every(...)`).

### Permiso condicional en el servicio (campo opcional)

Cuando un endpoint admite un campo opcional que requiere un permiso extra, **no** lo pongas en `@RequirePermissions` del handler (sería AND y bloquearía el flujo normal). Valida en el servicio solo si el campo viene:

```typescript
// POST /sales → @RequirePermissions(Permission.SALES_CREATE)
// Si el body trae soldAt, el servicio exige además sales.backdate:
if (soldAt && !auth.permissions.includes(Permission.SALES_BACKDATE)) {
  throw SalesException.backdateForbidden(); // 403 SALE_BACKDATE_FORBIDDEN
}
```

En web, oculta la UI con `can(Permission.SALES_BACKDATE)` (o `<Can>`); el backend sigue siendo la autoridad.

### Rutas branch-scoped (capa extra)

Además del permiso, valida sucursal con `BranchAccessService`:

```typescript
@RequirePermissions(Permission.CASH_READ)
@Get()
async findAll(@Company() company: CompanyContext, @Query("branchId") queryBranchId?: string) {
  const branchId = await this.branchAccessService.resolveBranchId(
    company.companyId,
    queryBranchId,
    company.branchId,
  );
  return this.service.findAllByBranch(branchId);
}
```

Ver [`apps/api/docs/tenant-access.md`](../apps/api/docs/tenant-access.md).

### Plataforma

```typescript
import { RequirePlatformAdmin } from "src/common/platform";

@Controller("platform")
@RequirePlatformAdmin()
export class PlatformController {
  @Get("overview")
  getOverview() { ... }
}
```

### Gestión de empresa (OWNER / Super Admin)

```typescript
import { RequireCompanyOwnerOrPlatformAdmin } from "src/common/company";
import { Auth } from "src/auth/decorators/auth.decorator";

@RequireCompanyOwnerOrPlatformAdmin()
@Patch(":id/activate")
activate(@Param("id") id: string, @Auth() auth: AuthContext) {
  return this.companyService.activate(id, auth);
}
```

En servicios, usa `assertCompanyAccessOrPlatformAdmin(companyId, auth)` para evitar IDOR cross-tenant.

### Respuestas de error

| Código | Cuándo                                                            |
| ------ | ----------------------------------------------------------------- |
| `401`  | JWT inválido o usuario inactivo                                   |
| `403`  | Sin empresa, empresa inactiva, sin permiso, sucursal no permitida |

---

## 5. Web — hook y componentes

### `usePermissions()`

```typescript
import { Permission, usePermissions } from "@/modules/auth";

function MyComponent() {
  const { can, canAll, canAny, isSuperAdmin, canManageCompany, roleName } =
    usePermissions();

  if (can(Permission.PRODUCTS_CREATE)) {
    /* mostrar lógica */
  }
  if (canAll(Permission.CASH_READ, Permission.CASH_OPEN)) {
    /* ambos */
  }
  if (canAny(Permission.SALES_READ, Permission.PURCHASES_READ)) {
    /* uno */
  }
}
```

| API                | Uso                                                                       |
| ------------------ | ------------------------------------------------------------------------- |
| `can(permission)`  | Un permiso tenant                                                         |
| `canAll(...perms)` | Todos los permisos                                                        |
| `canAny(...perms)` | Al menos uno                                                              |
| `isSuperAdmin`     | Admin de plataforma (no bypass de `can()`)                                |
| `canManageCompany` | `OWNER` o Super Admin (paridad con `@RequireCompanyOwnerOrPlatformAdmin`) |

**Archivo:** `apps/web/src/modules/auth/hooks/use-permissions.ts`

### `<Can>` — ocultar controles por permiso

```tsx
import { Permission } from "@repo/shared";
import { Can } from "@/shared/ui";

<Can permission={Permission.PRODUCTS_DELETE}>
  <DeleteButton onClick={handleDelete} />
</Can>

<Can
  permission={Permission.USERS_CREATE}
  fallback={<p className="text-muted">Sin permiso para crear usuarios</p>}
>
  <CreateUserButton />
</Can>
```

- No renderiza hijos si falta el permiso (default: `null`).
- **No** aplica bypass por `isSuperAdmin`.

**Archivo:** `apps/web/src/shared/ui/can.tsx`

### `<CanCompanyOwner>` — pantallas de administración de empresa

```tsx
import { CanCompanyOwner } from "@/shared/ui";

<CanCompanyOwner>
  <Button onClick={openCreateCompany}>Nueva empresa</Button>
</CanCompanyOwner>;
```

Equivalente UI de `{ type: "role", role: TenantRole.OWNER }` en nav y `@RequireCompanyOwnerOrPlatformAdmin()` en API.

**Archivo:** `apps/web/src/shared/ui/can-company-owner.tsx`

### `<CanPlatformAdmin>` — UI de plataforma

```tsx
import { CanPlatformAdmin } from "@/shared/ui";

<CanPlatformAdmin>
  <Link href="/platform/companies">Gestionar empresas</Link>
</CanPlatformAdmin>;
```

Usa `isSuperAdmin`, no `can()`.

**Archivo:** `apps/web/src/shared/ui/can-platform-admin.tsx`

---

## 6. Web — sidebar y navegación

### Configuración en `nav.ts`

Cada ítem del sidebar declara su regla de acceso en `access`:

```typescript
// apps/web/src/config/nav.ts

export type NavAccess =
  | { type: "public" }                              // cualquier usuario con tenant
  | { type: "permission"; permission: PermissionCode }  // RBAC vía can()
  | { type: "role"; role: TenantRoleName }          // OWNER (+ Super Admin ve el ítem)
  | { type: "platform" };                           // solo isSuperAdmin

{
  label: "Productos",
  href: "/products",
  icon: Box,
  access: { type: "permission", permission: Permission.PRODUCTS_READ },
},
{
  label: "Empresa",
  href: "/companies",
  icon: Building2,
  access: { type: "role", role: TenantRole.OWNER },
},
{
  label: "Sucursales",
  href: "/companies/[slug]/branch",
  dynamicSlug: true,  // se sustituye por user.companySlug
  access: { type: "permission", permission: Permission.BRANCHES_READ },
},
```

### Filtrar ítems visibles

El sidebar ya usa `filterNavItems`:

```typescript
import { DASHBOARD_NAV_ITEMS, filterNavItems } from "@/config/nav";
import { usePermissions } from "@/modules/auth";

const { can, isSuperAdmin } = usePermissions();

const navItems = filterNavItems(DASHBOARD_NAV_ITEMS, {
  can,
  isSuperAdmin,
  roleName: user?.role?.name,
  hasTenant: Boolean(user?.companyId),
  companySlug: user?.companySlug ?? null,
});
```

`filterNavItems`:

1. Evalúa `canAccessNav(access, ctx)` por ítem.
2. Resuelve `dynamicSlug` (oculta Sucursales si no hay slug).
3. Elimina secciones vacías.

### Reglas de `canAccessNav`

| `access.type` | Visible si…                                    |
| ------------- | ---------------------------------------------- |
| `platform`    | `isSuperAdmin`                                 |
| `public`      | `hasTenant`                                    |
| `permission`  | `can(permission)` — **sin** bypass Super Admin |
| `role`        | `roleName === role` **o** `isSuperAdmin`       |

### Ítem activo en sidebar

Rutas anidadas (ej. `/cajas/[id]`) usan match por prefijo con **prioridad al href más específico**:

**Archivo:** `apps/web/src/shared/ui/sidebar/is-nav-link-active.ts`

Evita que `/companies` quede activo cuando estás en `/companies/mi-slug/branch`.

### Sidebar de plataforma

Ítems en `apps/web/src/config/platform-nav.ts`. Protegido por `PlatformGuard` en `(platform)/layout.tsx`, no por `PermissionGuard`.

### Quick links del dashboard

Mismo patrón con `filterQuickLinks(DASHBOARD_QUICK_LINKS, ctx)` en `nav.ts`.

---

## 7. Web — proteger rutas

### `PermissionGuard` (dashboard tenant)

Montado en `apps/web/src/app/(dashboard)/layout.tsx`.

Evalúa `canAccessRoute(pathname, ctx)` desde `route-access.ts`:

| Caso                                   | Comportamiento                               |
| -------------------------------------- | -------------------------------------------- |
| `/dashboard`                           | Siempre permitido                            |
| Ruta con regla en `ROUTE_ACCESS_RULES` | `canAccessNav`                               |
| Ruta sin regla                         | Permitida (Next devuelve 404 si no existe)   |
| Sin permiso                            | Redirect → `/forbidden?reason=no-permission` |
| Sin tenant                             | Redirect → `/forbidden?reason=no-tenant`     |
| Super Admin sin tenant                 | Redirect → `/platform/dashboard`             |

### Añadir regla para una ruta nueva

1. **Preferido:** agregar el ítem en `DASHBOARD_NAV_ITEMS` — `route-access.ts` deriva reglas automáticamente.
2. **Rutas extra** (no en sidebar): añadir en `EXTRA_ROUTE_RULES`:

```typescript
// apps/web/src/config/route-access.ts
const EXTRA_ROUTE_RULES: RouteAccessRule[] = [
  {
    match: /^\/cajas(\/[^/]+)?$/,
    access: { type: "permission", permission: Permission.CASH_READ },
  },
];
```

Usa regex para subrutas dinámicas. Las reglas más específicas tienen prioridad.

### `PlatformGuard` (plataforma)

Montado en `apps/web/src/app/(platform)/layout.tsx`. Solo verifica `isSuperAdmin`.

---

## 8. Web — bloquear acciones en pantallas

### Patrón en tablas CRUD

Separar permiso de **lectura** (acceso a la pantalla) de **mutación** (botones):

```tsx
// Pantalla: acceso vía PermissionGuard + nav (PRODUCTS_READ)
// Tabla: botones condicionados

<Can permission={Permission.PRODUCTS_UPDATE}>
  <IconButton onClick={() => onEdit(row)} aria-label="Editar" />
</Can>

<Can permission={Permission.PRODUCTS_DELETE}>
  <IconButton onClick={() => onDelete(row)} aria-label="Eliminar" />
</Can>
```

Referencia: `apps/web/src/modules/products/components/products-table.tsx` (y módulos similares).

### Toolbar con botón crear

`DataTableToolbar` acepta `createPermission`:

```tsx
<DataTableToolbar
  createLabel="Nuevo producto"
  onCreateClick={openCreate}
  createPermission={Permission.PRODUCTS_CREATE}
/>
```

Internamente envuelve el botón con `<Can>`.

**Archivo:** `apps/web/src/shared/data-table/data-table-toolbar.tsx`

### Lógica de negocio según permiso (no solo UI)

```typescript
// apps/web/src/shared/hooks/use-operational-branches.ts
const { can } = usePermissions();

if (can(Permission.BRANCHES_READ)) {
  // listar todas las sucursales operativas
} else {
  // solo la sucursal activa del JWT
}
```

Aunque ocultes el selector, la API también valida sucursal en endpoints branch-scoped.

**Ejemplo — fecha de venta pasada (POS `/sales`):** la pantalla se abre con `sales.create`; el botón/modal de fecha solo aparece si `can(Permission.SALES_BACKDATE)`. El payload envía `soldAt` solo en ese caso; la API lo rechaza sin el permiso.

### Jerarquía de roles (usuarios y empleados)

Además de `can()`, algunas pantallas limitan acciones según rol objetivo (`canManageTargetRole` en `shared/auth/role-hierarchy.ts`):

| Pantalla  | Container                       | Política API                    |
| --------- | ------------------------------- | ------------------------------- |
| Usuarios  | `users-table-container.tsx`     | `assertCanManageUser`           |
| Empleados | `employees-table-container.tsx` | `employee-management.policy.ts` |

### Manejo de 403 desde API

Si el usuario ve un botón por error de sincronización JWT, la API responde 403. Usa el interceptor/toast global para mostrar mensaje claro (ver checklist en `security-rbac-critical-review.md`).

---

## 9. Plataforma vs tenant

| Pregunta                     | Tenant                       | Plataforma                                 |
| ---------------------------- | ---------------------------- | ------------------------------------------ |
| ¿Cómo sé si puede?           | `can(Permission.X)`          | `isSuperAdmin`                             |
| ¿Decorador API?              | `@RequirePermissions`        | `@RequirePlatformAdmin`                    |
| ¿Componente web?             | `<Can>`                      | `<CanPlatformAdmin>` / `PlatformGuard`     |
| ¿Sidebar?                    | `sidebar.tsx` + `nav.ts`     | `platform-sidebar.tsx` + `platform-nav.ts` |
| ¿Super Admin ve ítems OWNER? | Sí en nav `{ type: "role" }` | N/A                                        |

**No hagas esto:**

```tsx
// ❌ Incorrecto — Super Admin no tiene permisos tenant en can()
if (can(Permission.PRODUCTS_READ) || isSuperAdmin) { ... }

// ✅ Correcto — pantalla tenant
if (can(Permission.PRODUCTS_READ)) { ... }

// ✅ Correcto — panel plataforma
if (isSuperAdmin) { ... }
```

---

## 10. Checklist: nuevo módulo CRUD

### Shared / BD

- [ ] Añadir códigos en `packages/shared/src/auth/permissions.ts` (`Permission.NEWDOMAIN_*`)
- [ ] Actualizar `ALL_PERMISSIONS` (descripciones para seed)
- [ ] Asignar permisos en `ROLE_PERMISSION_MATRIX`
- [ ] Migrar/seed permisos en BD (`packages/database/prisma/seed.ts`)

### API

- [ ] `@RequirePermissions(Permission.NEWDOMAIN_READ)` en `GET`
- [ ] `@RequirePermissions(Permission.NEWDOMAIN_CREATE)` en `POST`
- [ ] `@RequirePermissions(Permission.NEWDOMAIN_UPDATE)` en `PATCH`
- [ ] `@RequirePermissions(Permission.NEWDOMAIN_DELETE)` en `DELETE`
- [ ] Usar `@CompanyId()` para scope multi-tenant
- [ ] Si es branch-scoped: integrar `BranchAccessService`

### Web

- [ ] Ítem en `DASHBOARD_NAV_ITEMS` con `access: { type: "permission", permission: Permission.NEWDOMAIN_READ }`
- [ ] Página en `app/(dashboard)/newdomain/page.tsx`
- [ ] Si hay subrutas dinámicas: regla en `EXTRA_ROUTE_RULES`
- [ ] Botones crear/editar/eliminar envueltos en `<Can permission={...}>`
- [ ] Probar con usuario de rol sin permiso → sidebar oculto + `/forbidden` por URL + 403 en API

---

## 11. Errores frecuentes

| Error                                       | Solución                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| Super Admin no ve módulos tenant en sidebar | Esperado: no tiene `permissions` tenant. Debe ir a `/platform/*`.         |
| OWNER no ve "Empresa"                       | Verificar `roleName === OWNER` en JWT, no un permiso `Permission.*`.      |
| Ruta accesible por URL pero no en sidebar   | Falta ítem en `nav.ts` o regla en `EXTRA_ROUTE_RULES`.                    |
| Sidebar visible pero API 403                | Permiso de lectura en nav distinto al del endpoint, o JWT desactualizado. |
| `/companies` y Sucursales activos a la vez  | Usar `isNavLinkActive` (match más específico).                            |
| `@RequirePermissions` en ruta plataforma    | Usar `@RequirePlatformAdmin()`.                                           |
| Strings `"products.read"` sueltos           | Usar `Permission.PRODUCTS_READ` desde `@repo/shared`.                     |
| Confiar solo en `<Can>` para seguridad      | Siempre duplicar check en API con guard.                                  |

---

## Referencia rápida de archivos

```
packages/shared/src/auth/
├── permissions.ts          # Permission.*, PermissionCode
├── roles.ts                  # TenantRole.*
└── permission-matrix.ts      # ROLE_PERMISSION_MATRIX

apps/api/src/common/
├── permissions/              # @RequirePermissions, PermissionGuard
├── company/                  # @RequireCompany, @RequireCompanyOwnerOrPlatformAdmin
└── platform/                 # @RequirePlatformAdmin

apps/web/src/
├── config/nav.ts             # Sidebar, canAccessNav, filterNavItems
├── config/route-access.ts    # PermissionGuard rules
├── modules/auth/hooks/use-permissions.ts
├── modules/auth/components/permission-guard.tsx
├── modules/auth/components/platform-guard.tsx
└── shared/ui/can*.tsx        # Can, CanCompanyOwner, CanPlatformAdmin
```
