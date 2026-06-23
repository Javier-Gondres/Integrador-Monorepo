# Roadmap: administración de plataforma y RBAC multi-nivel

Este documento describe la **evolución planificada** del ERP multiempresa hacia un modelo de autorización en dos niveles: **plataforma (SaaS)** y **empresa (tenant)**.

> **Importante:** la **administración de plataforma** (rutas `/platform/*`) sigue siendo evolución futura.  
> El **RBAC tenant**, guards, permisos granulares y flags `isSuperAdmin` **ya están implementados** en la API.

---

## Estado actual (fase vigente)

### Modelos relevantes

```text
User (+ isSuperAdmin)
Role (+ Permission / RolePermission)
UserCompany
Company (+ isActive)
Branch (+ isActive)
Employee (+ branchId, isActive)
Supplier
```

### Flujo de autorización en rutas de negocio

```text
JwtAuthGuard
        ↓
CompanyGuard          → company.isActive en BD (403 si inactiva)
        ↓
PermissionGuard       → permisos en JWT (@RequirePermissions)
        ↓
BranchAccessService   → branch.isActive (solo flujos branch-scoped)
        ↓
Servicio / assertEmployeeForBranchOperation (caja, etc.)
```

**Catálogo company-wide** (`products`, `categories`, `customers`, `suppliers`, `discounts`): capa CompanyGuard + RBAC; **no** exige sucursal activa.

Documentación: `apps/api/docs/tenant-access.md` y `apps/api/docs/auth-and-utilities.md`.

### Lo que el sistema asume hoy

```text
Usuario autenticado
        ↓
Tiene UserCompany (membresía única)
        ↓
JWT: companyId + branchId + role + permissions[] + isSuperAdmin
        ↓
Operaciones tenant scoped a companyId (y branchId donde aplique)
```

### Lo que **existe** en infraestructura (sin UI de plataforma)

- `User.isSuperAdmin` + `PlatformAdminGuard` + `@RequirePlatformAdmin()` (sin rutas HTTP aún).
- `@RequireCompanyOwnerOrPlatformAdmin()` en gestión de `Company` (OWNER / SUPER_ADMIN).
- Matriz RBAC en seed (`ALL_PERMISSIONS`, `ROLE_PERMISSIONS`).
- Jerarquía de roles en usuarios (`assert-assignable-role.ts`).

### Lo que **no** existe aún (fase plataforma)

Rutas y pantallas dedicadas para operadores SaaS:

```text
Dashboard cross-tenant
Métricas globales
Impersonación / soporte
CRUD de tenants desde /platform/*
```

Ese hueco se cubrirá con **Platform Roles** expuestos vía `@RequirePlatformAdmin()`.

### Qué **no** debe cambiarse en esta fase

- Módulos `Employee` y `Supplier` (API y schema actuales).
- Modelo `UserCompany` y su relación con `Role` tenant-scoped.
- Patrón `CompanyGuard` para rutas de tenant.

La implementación actual es la base correcta; este roadmap solo anticipa la capa de plataforma.

---

## Visión: dos niveles de autorización

El ERP se implementará con **dos dominios de permisos** separados explícitamente. En arquitecturas SaaS multi-tenant maduras, los roles globales (plataforma) y los roles por tenant (empresa) suelen vivir en capas distintas porque su **alcance** y **riesgo** son diferentes.

| Nivel                    | Alcance       | Pregunta que responde                        |
| ------------------------ | ------------- | -------------------------------------------- |
| **1 — Plataforma**       | Todo el SaaS  | ¿Quién administra el producto y los tenants? |
| **2 — Empresa (tenant)** | Una `Company` | ¿Quién administra esta empresa concreta?     |

---

## Nivel 1 — Plataforma (futuro)

### Responsabilidad

```text
Administrar el SaaS completo
```

### Roles futuros (Platform Roles)

```text
SUPER_ADMIN
SUPPORT
```

### Características clave

- Estos usuarios **no pertenecen a una empresa** en el sentido operativo del ERP.
- **No** deben modelarse como filas en `UserCompany` con un rol “especial”.
- Son **Platform Roles**: permisos cross-tenant, fuera del scope `companyId`.

### Capacidades planeadas

| Acción                                | SUPER_ADMIN | SUPPORT (típico) |
| ------------------------------------- | ----------- | ---------------- |
| Crear empresas                        | Sí          | No / limitado    |
| Suspender empresas                    | Sí          | Según política   |
| Activar empresas                      | Sí          | Según política   |
| Crear Owner inicial                   | Sí          | No               |
| Ver métricas globales                 | Sí          | Lectura parcial  |
| Dar soporte (impersonación / lectura) | Sí          | Sí               |

### Guard / contexto futuro (conceptual)

Hoy: `CompanyGuard` exige `companyId`.

Futuro (no implementado): algo equivalente a `PlatformGuard` que valide `platformRole` **sin** exigir tenant, o rutas bajo prefijo `/platform/*` separadas de `/companies/*` tenant-scoped.

---

## Nivel 2 — Empresa / tenant (actual + evolución RBAC)

### Responsabilidad

```text
Administrar una empresa específica
```

### Roles (Company Roles) — ya en schema

```text
OWNER
ADMIN
MANAGER
CASHIER
INVENTORY_ASSISTANT
```

Definidos en el enum `RoleName` y asignados vía **`UserCompany`**.

### Modelo mental

```text
User
  ↓
UserCompany   (membresía: userId + companyId + roleId)
  ↓
Company
  ↓
Role          (tenant-scoped: el rol solo tiene sentido dentro de esa empresa)
```

Las asignaciones de rol **siempre** se evalúan en el contexto de **una** empresa. Un mismo `User` puede tener distintos roles en distintas empresas (distintas filas `UserCompany`), pero cada operación tenant-scoped usa el `companyId` activo del JWT / sesión.

### Relación con Employee

```text
Employee
  ├─ companyId  (obligatorio)
  ├─ branchId   (obligatorio)
  └─ userId     (obligatorio — todo empleado tiene acceso al ERP)
```

`Employee` es RRHH vinculado 1:1 a `User`. Alta vía `POST /employees` (transacción User + UserCompany + Employee). Ver `docs/employee-user-registration-flow.md`.

---

## Comparación: Platform Roles vs Company Roles

| Aspecto                 | Platform Roles                               | Company Roles                  |
| ----------------------- | -------------------------------------------- | ------------------------------ |
| Ejemplos                | `SUPER_ADMIN`, `SUPPORT`                     | `OWNER`, `ADMIN`, `CASHIER`, … |
| Tabla / campo           | Futuro: `User.platformRole` o tabla dedicada | `UserCompany.roleId` → `Role`  |
| Scope                   | Cross-tenant (todo el SaaS)                  | Una `Company`                  |
| ¿Usa `CompanyGuard`?    | No (rutas de plataforma)                     | Sí (rutas de negocio)          |
| ¿Vive en `UserCompany`? | **No**                                       | **Sí**                         |
| Implementado hoy        | No                                           | Sí (sin `RolesGuard` fino aún) |

---

## ¿Qué es un SUPER_ADMIN?

Actor de **plataforma** (operador del SaaS), no empleado ni dueño de una tienda.

- Puede crear tenants (`Company`) y el primer `OWNER`.
- No reemplaza al `OWNER` dentro de la empresa: el Owner configura sucursales, empleados, catálogo, etc.
- No debe confundirse con `RoleName.OWNER`: el Owner es **tenant-scoped**; el Super Admin es **platform-scoped**.
- **Creación de usuarios:** el Super Admin provisiona el tenant (empresa + owner inicial y, en el futuro, operadores de plataforma). **No** comparte el mismo flujo que el Owner, que solo **invita** usuarios a su empresa. Detalle: `docs/user-management-roadmap.md`.

```text
SUPER_ADMIN     →  opera el producto (muchas empresas)
OWNER           →  opera su empresa (una Company)
```

---

## Flujo futuro de onboarding (planeado)

### Paso 1 — Super Admin crea empresa

```text
SUPER_ADMIN
      ↓
POST /platform/companies   (ruta futura, ejemplo)
      ↓
Company creada (slug, nombre, estado)
```

### Paso 2 — Super Admin crea Owner inicial

```text
SUPER_ADMIN
      ↓
Create User (email, password, firstName, lastName)
      ↓
Create UserCompany
  - companyId = empresa nueva
  - roleId    = OWNER
      ↓
(Opcional) Create Employee vinculado al mismo User
```

El Owner es el primer usuario con poder administrativo **dentro** del tenant.

### Paso 3 — Owner accede al ERP

```text
OWNER (JWT + CompanyGuard + companyId)
      ↓
Configura sucursales (Branch)
      ↓
Invita o crea más usuarios (futuro RBAC por rol)
```

> **Gestión de usuarios (diseño objetivo):** el Owner **invita** miembros a su empresa y puede **expulsarlos** (revocar `UserCompany`), pero **no** debe poder **eliminar** la cuenta global (`User`). Esa operación corresponde al **Super Admin** a nivel plataforma. La UI tenant actual en `/users` es **provisional** y aún no distingue invitar / expulsar / eliminar. Ver `docs/user-management-roadmap.md`.

### Paso 4 — Owner registra empleados

```http
POST /employees
```

Crea en una transacción: `User` + `UserCompany` + `Employee`.

### Paso 5 — Owner administra su empresa

Dominios tenant-scoped (actuales o por venir):

```text
Productos · Categorías · Proveedores · Inventario · Ventas · Caja · …
```

Todo con el mismo patrón: `JWT` → `CompanyGuard` → `companyId`.

```mermaid
sequenceDiagram
  participant SA as SUPER_ADMIN
  participant P as API Plataforma (futuro)
  participant DB as Base de datos
  participant O as OWNER
  participant API as API Tenant (actual)

  SA->>P: Crear Company
  P->>DB: INSERT Company
  SA->>P: Crear User + UserCompany (OWNER)
  P->>DB: INSERT User, UserCompany
  O->>API: Login JWT
  O->>API: POST /branches, POST /employees, …
  API->>DB: Operaciones WHERE companyId = tenant
```

---

## Jerarquía objetivo (fase futura)

```text
SUPER_ADMIN  (plataforma)
        │
        ├── Company A
        │      ├── OWNER
        │      ├── ADMIN
        │      ├── MANAGER
        │      ├── CASHIER / INVENTORY_ASSISTANT (vía UserCompany)
        │      └── EMPLOYEES (RRHH; algunos con User vinculado)
        │
        ├── Company B
        │      ├── OWNER
        │      └── EMPLOYEES / usuarios…
        │
        └── Company C
               └── …
```

```mermaid
flowchart TB
  subgraph Platform["Nivel 1 — Plataforma (futuro)"]
    SA[SUPER_ADMIN]
    SUP[SUPPORT]
  end

  subgraph TenantA["Company A — Tenant"]
    OA[OWNER]
    AA[ADMIN]
    MA[MANAGER]
    EA[Employees / Users]
    OA --> AA
    OA --> MA
    OA --> EA
  end

  subgraph TenantB["Company B — Tenant"]
    OB[OWNER]
    EB[Employees / Users]
    OB --> EB
  end

  SA --> TenantA
  SA --> TenantB
  SUP -.->|soporte lectura| TenantA
```

---

## Evolución futura del schema (referencia — NO IMPLEMENTAR AHORA)

Hoy `User` no tiene roles de plataforma. Solo se relaciona con empresas mediante `UserCompany`.

### Opción A — campo en `User`

```prisma
// FASE FUTURA — NO APLICAR EN ESTA ITERACIÓN

enum PlatformRole {
  SUPER_ADMIN
  SUPPORT
}

model User {
  // ... campos actuales ...
  platformRole PlatformRole?
}
```

- `platformRole = null` → usuario “normal” (solo tenant vía `UserCompany`).
- `platformRole = SUPER_ADMIN` → rutas de plataforma sin depender de `UserCompany`.

### Opción B — tabla dedicada

```prisma
// FASE FUTURA — ilustrativo

model PlatformMembership {
  id     String @id @default(cuid())
  userId String @unique
  role   PlatformRole
  user   User   @relation(...)
}
```

Útil si más adelante hay varios roles de plataforma con metadatos (expiración, auditoría, etc.).

### Por qué no implementar ahora

```text
CompanyGuard + UserCompany + Role (tenant)
```

cubren **todos** los requisitos funcionales de la fase actual:

- Multiempresa por membresía.
- Empleados y proveedores por `companyId`.
- Usuarios con rol por empresa.

Añadir `SUPER_ADMIN` antes de definir rutas `/platform/*`, guards y políticas de soporte solo añadiría complejidad y superficie de error sin entregar valor inmediato.

---

## Interacción User · UserCompany · Company (resumen)

| Entidad       | Rol en el sistema                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `User`        | Identidad global (email, contraseña, perfil). Puede tener 0..N membresías tenant y 0..1 `Employee`. |
| `Company`     | Tenant / empresa cliente del SaaS.                                                                  |
| `UserCompany` | Une `User` + `Company` + `Role` (tenant). Es la fuente de verdad del **rol empresarial**.           |
| `Role`        | Catálogo de roles **por tenant** (`RoleName`).                                                      |
| `Branch`      | Sucursal; `Employee.branchId` obligatorio.                                                          |
| `Employee`    | Usuario operativo del ERP; `userId` obligatorio.                                                    |

```mermaid
erDiagram
  User ||--o{ UserCompany : memberships
  User ||--o| Employee : employee
  Company ||--o{ UserCompany : users
  Company ||--o{ Branch : branches
  Company ||--o{ Employee : employees
  Company ||--o{ Supplier : suppliers
  Role ||--o{ UserCompany : assignments
  Branch ||--o{ Employee : staff
```

**Futuro:** `User` podría además tener `platformRole` (o tabla equivalente) **sin** fila en `UserCompany` para operadores del SaaS.

---

## RBAC tenant: estado y siguiente paso

| Capacidad                                  | Estado                                                |
| ------------------------------------------ | ----------------------------------------------------- |
| Membresía por empresa (`UserCompany`)      | Implementado                                          |
| `CompanyGuard` + `company.isActive` en BD  | Implementado                                          |
| `BranchAccessService` + `branch.isActive`  | Implementado (flujos branch-scoped)                   |
| `@RequirePermissions` + `PermissionGuard`  | Implementado (controllers tenant)                     |
| Enum `RoleName` + seed `RolePermission`    | Implementado                                          |
| Jerarquía roles (`assert-assignable-role`) | Implementado (users / employees.create)               |
| Política empleado ↔ sucursal + `openShift` | Implementado                                          |
| `User.isSuperAdmin` + guard plataforma     | Infra lista; **sin rutas `/platform`**                |
| UI permisos (`usePermissions`, `<Can>`)    | Hook/componente listos; adopción parcial en pantallas |

Los permisos tenant se derivan de `UserCompany.role` al emitir JWT (login/refresh/switchBranch). **No** mezclar con `isSuperAdmin` en endpoints tenant.

Documentación detallada: `apps/api/docs/tenant-access.md`.

**Siguiente paso:** rutas y frontend de administración de plataforma (`@RequirePlatformAdmin()`), no reimplementar RBAC tenant.

---

## Documentos relacionados

| Archivo                                   | Contenido                                                          |
| ----------------------------------------- | ------------------------------------------------------------------ |
| `docs/employee-user-registration-flow.md` | Employee siempre con User; `POST /employees` transaccional         |
| `docs/platform-admin-roadmap.md`          | Plataforma vs tenant, SUPER_ADMIN, onboarding futuro               |
| `apps/api/docs/tenant-access.md`          | Capas CompanyGuard / BranchAccess / catálogo / empleado ↔ sucursal |
| `apps/api/docs/auth-and-utilities.md`     | Auth, guards, RBAC, errores                                        |
| `packages/database/prisma/seed.ts`        | Permisos y matriz por rol                                          |

---

## Conclusión para el equipo

1. **La implementación actual es correcta** para la fase del proyecto: no refactorizar Employee, Supplier ni UserCompany por este roadmap.
2. **Falta solo documentación de evolución** hacia administración de plataforma y RBAC fino — este documento cumple ese rol.
3. **Platform Roles** (`SUPER_ADMIN`, `SUPPORT`) y **Company Roles** (`OWNER`, `ADMIN`, …) deben permanecer **conceptual y físicamente separados** cuando se implemente la fase 2.
4. El onboarding de nuevos clientes del SaaS seguirá: **Super Admin crea Company + Owner** → **Owner opera el tenant** con las APIs existentes (`/employees`, `/suppliers`, etc.) bajo `CompanyGuard`.

**Fase futura del ERP — no bloqueante para el desarrollo actual.**
