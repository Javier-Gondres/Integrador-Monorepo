# Revisión crítica — RBAC, web y Super Admin

Documento de referencia sobre el **análisis de seguridad y diseño** realizado sobre el sistema de autorización multi-nivel (plataforma + tenant). Incluye hallazgos, severidad, estado de remediación y acciones pendientes.

**Audiencia:** equipo de desarrollo, revisores de PR, continuidad con IA.

**Documentación relacionada:**

| Archivo                               | Contenido                                          |
| ------------------------------------- | -------------------------------------------------- |
| `docs/platform-admin-roadmap.md`      | Plataforma vs tenant, dos flujos de onboarding     |
| `docs/user-management-roadmap.md`     | Usuarios provisional, invitar/expulsar vs eliminar |
| `apps/api/docs/auth-and-utilities.md` | Guards, endpoints, semántica HTTP                  |
| `apps/api/docs/tenant-access.md`      | CompanyGuard, BranchAccess, empleado ↔ sucursal    |
| `apps/web/ARCHITECTURE.md`            | §18 RBAC, §18.1 usuarios, §18.2 plataforma         |

**Última actualización:** refleja fix **Opción A** (Super Admin sin `UserCompany`) y aclaración de **self-service** `POST /companies` como diseño intencional.

---

## Resumen ejecutivo

| Severidad | Total | Resuelto / aclarado | Pendiente |
| --------- | ----- | ------------------- | --------- |
| Crítico   | 4     | 2                   | 2         |
| Alto      | 6     | 1                   | 5         |
| Medio     | 5     | 0                   | 5         |
| Bajo      | 4     | 0                   | 4         |

**Conclusión:** La base RBAC tenant (`@RequirePermissions`, `@repo/shared`, guards web) es sólida para desarrollo. Los riesgos más urgentes restantes son: delete de usuarios vs empleados, JWT stale para revocación, y alinear permisos/documentación de gestión de usuarios con el diseño objetivo (expulsar, no eliminar).

---

## Modelo de autorización (contexto)

```text
Plataforma (SaaS)          Tenant (empresa)
─────────────────          ─────────────────
User.isSuperAdmin          UserCompany → Role → Permission[]
@RequirePlatformAdmin()  @RequirePermissions()
Rutas /platform/*        Rutas de negocio + CompanyGuard
```

**Reglas no negociables:**

1. `isSuperAdmin` **no** hace bypass en `can()` / `<Can>` / `PermissionGuard` tenant.
2. Un Super Admin **no** puede tener membresía `UserCompany` (Opción A — enforceada).
3. Existen **dos onboardings válidos** de tenant (ver § Diseño intencional).
4. El backend es la autoridad; la UI solo oculta controles.

---

## Diseño intencional (no es deuda)

### Dos flujos de alta de tenant

| Flujo                    | Endpoint                   | Actor                                     | Resultado                                          |
| ------------------------ | -------------------------- | ----------------------------------------- | -------------------------------------------------- |
| **Self-service**         | `POST /companies`          | Usuario autenticado **sin** `UserCompany` | Company + branch; el mismo usuario queda **OWNER** |
| **Provisión plataforma** | `POST /platform/companies` | Super Admin                               | Company + branch + **otro** usuario OWNER          |

El self-service **no** se considera vulnerabilidad: es el onboarding previsto para que usuarios creen su propia empresa.

**Restricciones vigentes:**

- Usuario con membresía existente → `409` (no puede crear otra).
- Super Admin → `403` en `POST /companies` (`super-admin-tenant.policy.ts`).

Detalle: `docs/platform-admin-roadmap.md` (§ «Dos flujos de alta de tenant»).

---

## Crítico

### C1 — Self-service `POST /companies`

| Campo                  | Valor                                   |
| ---------------------- | --------------------------------------- |
| **Estado**             | ✅ **Diseño intencional** — no remediar |
| **Severidad original** | Crítico (revisión inicial)              |
| **Reclasificación**    | Feature de producto                     |

**Descripción:** Cualquier usuario autenticado sin tenant puede crear su empresa vía `POST /companies` (`@JwtAuth()` + `createOnboarding`).

**Por qué no es bug:** El producto admite registro → login → crear mi empresa → operar ERP.

**Archivos:** `apps/api/src/company/company.controller.ts`, `company.service.ts`, `company.repository.ts`.

**Acción futura opcional:** UI de onboarding dedicada (wizard post-login) en lugar de pantalla legacy `/companies`.

---

### C2 — Super Admin dual-role (platform + tenant)

| Campo         | Valor                      |
| ------------- | -------------------------- |
| **Estado**    | ✅ **Resuelto** (Opción A) |
| **Severidad** | Crítico                    |

**Problema:** Un usuario con `isSuperAdmin = true` podía obtener `UserCompany` OWNER (p. ej. vía `POST /companies`) y operar **plataforma + tenant** simultáneamente. Viola: _«un actor, un dominio de autoridad»_.

**Riesgos:** privilege chaining, auditoría ambigua, JWT con permisos OWNER + flag plataforma.

**Fix implementado:**

| Capa       | Mecanismo                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------- |
| Política   | `apps/api/src/common/platform/policies/super-admin-tenant.policy.ts`                      |
| Service    | `assertSuperAdminCannotJoinTenant(auth)` en `createOnboarding`                            |
| Repository | `assertUserEligibleForTenantMembership` en transacción `createWithOnboarding`             |
| Auth       | `stripTenantMembershipForSuperAdmin` en `findAuthContext`                                 |
| JWT        | `buildAccessTokenClaims` — si `isSuperAdmin`, `companyId`/`role`/`permissions` en null/[] |

**Export:** `apps/api/src/common/platform/index.ts`.

---

### C3 — `DELETE /users/:id` y empleados huérfanos

| Campo         | Valor            |
| ------------- | ---------------- |
| **Estado**    | ❌ **Pendiente** |
| **Severidad** | Crítico          |

**Problema:** `removeUser` hace soft delete de `User` + `UserCompany` y **no** toca `Employee`. El empleado queda activo con `userId` apuntando a usuario eliminado/inactivo.

**Efectos:**

- Sin login operativo para ese empleado.
- Posible crash en web: `employee.mapper.ts` asume `dto.user` siempre presente.
- Inconsistencia de datos.

**Archivos:** `apps/api/src/users/users.service.ts`, `users.repository.ts` (`softDeleteInCompany`).

**Remediación recomendada (elegir una):**

1. Bloquear delete si existe `Employee` activo vinculado.
2. Cascada: soft delete empleado al eliminar usuario.
3. Preferir **expulsar** (solo `UserCompany`) en lugar de delete global para Owner.

Ver: `docs/user-management-roadmap.md`.

---

### C4 — JWT: `isSuperAdmin` y permisos no revalidados en BD

| Campo         | Valor                                  |
| ------------- | -------------------------------------- |
| **Estado**    | ❌ **Pendiente**                       |
| **Severidad** | Crítico (ventana ~15 min access token) |

**Problema:** `JwtStrategy.validate()` solo revalida `user.isActive`. `isSuperAdmin` y `permissions[]` vienen del payload JWT hasta expiración o refresh.

**Riesgo:** Revocar Super Admin o cambiar rol/permisos en BD no surte efecto inmediato.

**Archivos:** `apps/api/src/auth/strategies/jwt.strategy.ts`, `platform-admin.guard.ts`, `permission.guard.ts`.

**Remediación recomendada:**

- Releer `isSuperAdmin` desde BD en `JwtStrategy` o `PlatformAdminGuard`.
- Opcional: revalidar permisos críticos en `PermissionGuard`.
- Revocar refresh tokens al cambiar rol / desactivar / quitar Super Admin.

---

## Alto

### A1 — OWNER/ADMIN con `users.delete` vs diseño «expulsar»

| Campo         | Valor        |
| ------------- | ------------ |
| **Estado**    | ❌ Pendiente |
| **Severidad** | Alto         |

**Problema:** Matriz en `@repo/shared`: OWNER = todos los permisos; ADMIN incluye `users.delete`. La documentación objetivo dice: Owner **expulsa** (solo membresía), no elimina cuenta global.

**Archivos:** `packages/shared/src/auth/permission-matrix.ts`, UI `/users`, `users.controller.ts`.

**Acción:** Quitar `users.delete` de OWNER/ADMIN; endpoint `expel`; reservar delete a plataforma.

---

### A2 — Dos caminos de alta de tenant (confusión operativa)

| Campo                  | Valor                            |
| ---------------------- | -------------------------------- |
| **Estado**             | ✅ **Aclarado en documentación** |
| **Severidad original** | Alto                             |

No es vulnerabilidad si se entiende el modelo. Riesgo restante: **UX confusa** (`/companies` legacy vs `/platform/companies`).

**Acción opcional:** Pantalla onboarding self-service clara; banner en `/companies` para Super Admin (no aplica — ya bloqueado en API).

---

### A3 — `PermissionGuard` web: rutas sin regla → permitidas

| Campo         | Valor                   |
| ------------- | ----------------------- |
| **Estado**    | ❌ Pendiente            |
| **Severidad** | Alto (defense in depth) |

**Problema:** En `route-access.ts`, si no hay regla para un pathname, `canAccessRoute` devuelve `true` (solo exige tenant).

**Archivo:** `apps/web/src/config/route-access.ts`.

**Acción:** Default **deny** (whitelist) o registrar todas las rutas de `(dashboard)`.

---

### A4 — Protección web `/platform/*` solo en cliente

| Campo         | Valor                               |
| ------------- | ----------------------------------- |
| **Estado**    | ⚠️ Aceptable con API como autoridad |
| **Severidad** | Alto (UX)                           |

`PlatformGuard` usa `isSuperAdmin` del store. API responde 401/403. Mejora opcional: middleware Next.js server-side.

---

### A5 — Super Admin ve ítems `role: OWNER` en sidebar tenant

| Campo         | Valor                               |
| ------------- | ----------------------------------- |
| **Estado**    | ✅ Mitigado por C2                  |
| **Severidad** | Alto (era dependiente de dual-role) |

Con Opción A, Super Admin sin membership no opera tenant. Si tuviera membership inconsistente en BD, JWT la ignora.

---

### A6 — `DELETE /companies/:id` disponible para OWNER

| Campo         | Valor                               |
| ------------- | ----------------------------------- |
| **Estado**    | ❌ Pendiente (decisión de producto) |
| **Severidad** | Alto                                |

Owner puede soft-delete toda la empresa desde API/UI legacy.

**Acción:** Definir si Owner puede «cerrar» tenant o solo plataforma suspende (`PATCH .../deactivate` vía plataforma).

---

## Medio

### M1 — Permisos JWT stale tras cambio de rol (~15 min)

| Estado | Pendiente |
| Acción | Revocar refresh al cambiar rol; endpoint refresh de sesión; documentar ventana |

---

### M2 — Desactivar/eliminar usuario sin revocar refresh tokens explícitamente

| Estado | Pendiente |
| Nota | `isActive = false` bloquea JWT en `JwtStrategy`; mejor llamar `logoutAllSessions` como en change password |

**Archivo:** `apps/api/src/users/users.service.ts`

---

### M3 — Mapper empleados frágil (`dto.user` null)

| Estado | Pendiente |
| Archivo | `apps/web/src/modules/employees/mappers/employee.mapper.ts` |
| Relacionado | C3 |

---

### M4 — Permisos en catálogo sin módulos HTTP

| Estado | Pendiente (preventivo) |
| Permisos | `SALES_*`, `INVENTORY_*`, `PURCHASES_*`, `REPORTS_READ` |
| Acción | Proteger controllers al implementar módulos |

---

### M5 — Sin auditoría en acciones de plataforma

| Estado | Pendiente |
| Acción | `AuditLog` cross-tenant para create/suspend tenant, cambios Super Admin |

---

## Bajo / pendiente funcional

| ID  | Item                                                   | Estado                   |
| --- | ------------------------------------------------------ | ------------------------ |
| B1  | Selector `switchBranch` en UI                          | Pendiente                |
| B2  | Toast global ante 403 API                              | Pendiente                |
| B3  | Módulos web: inventario, ventas, compras, reportes     | Pendiente                |
| B4  | Flujo invitar/expulsar usuarios (doc hecho, código no) | Pendiente                |
| B5  | Credenciales seed en repo (`Password123`)              | Solo dev — rotar en prod |
| B6  | `console.warn` en `JwtStrategy`                        | Menor — usar logger      |

---

## Lo implementado correctamente (mantener)

1. Separación conceptual plataforma / tenant en web (`can()` sin bypass Super Admin).
2. `GET /auth/session` separado de `/me` para Super Admin sin tenant.
3. `@RequirePermissions` en controllers tenant principales.
4. `assertCompanyAccessOrPlatformAdmin` — Owner no accede cross-tenant por `:id`.
5. Jerarquía de roles (`assert-assignable-role.ts`) — no asignar OWNER; no gestionar par o superior.
6. Plataforma API con `@RequirePlatformAdmin()` sin `CompanyGuard`.
7. Catálogo único `@repo/shared` — evitar strings sueltos de permisos.
8. Módulo web `/platform/*` + `PlatformGuard` + onboarding plataforma.

---

## Backlog priorizado

| Prioridad | ID     | Acción                                                           |
| --------- | ------ | ---------------------------------------------------------------- |
| **P0**    | C3     | Coordinar delete/expulsar usuario con `Employee`                 |
| **P0**    | C4     | Revalidar `isSuperAdmin` (y opcional permisos) en BD por request |
| **P1**    | A1     | Expulsar vs delete; quitar `users.delete` de OWNER               |
| **P1**    | A3     | Default deny en `canAccessRoute`                                 |
| **P1**    | A6     | Política de borrado de tenant (Owner vs plataforma)              |
| **P2**    | M1, M2 | Revocación de sesiones al cambiar rol/desactivar                 |
| **P2**    | M3     | Null-safe en mapper empleados                                    |
| **P2**    | M5     | Auditoría plataforma                                             |
| **P3**    | B1–B4  | UX y módulos futuros                                             |

---

## Matriz de verificación manual

Checklist por rol (seed `packages/database/prisma/seed.ts`):

| Actor       | Email seed               | Debe poder                                                | No debe poder                                                     |
| ----------- | ------------------------ | --------------------------------------------------------- | ----------------------------------------------------------------- |
| Super Admin | `superadmin@ejemplo.com` | `/platform/*`, listar/suspender tenants                   | `POST /companies`, ERP tenant, `can('products.*')` sin membership |
| Owner       | `prueba@ejemplo.com`     | ERP completo, `POST /companies` solo si sin tenant previo | `/platform/*`                                                     |
| Admin       | `admin@ejemplo.com`      | Según matriz ADMIN                                        | Gestionar OWNER, `/platform/*`                                    |
| Cajero      | `cajero@ejemplo.com`     | Caja, ventas (futuro), lectura catálogo                   | Crear productos, `/users`, `/platform/*`                          |

Password dev común: `Password123`.

---

## Historial de cambios en este documento

| Fecha   | Cambio                                                     |
| ------- | ---------------------------------------------------------- |
| 2026-06 | Análisis inicial post-implementación RBAC + plataforma web |
| 2026-06 | C1 reclasificado como diseño intencional (self-service)    |
| 2026-06 | C2 marcado resuelto (`super-admin-tenant.policy.ts`)       |

---

## Referencia rápida de archivos clave

```text
Política Super Admin ↔ tenant
  apps/api/src/common/platform/policies/super-admin-tenant.policy.ts

Guards
  apps/api/src/common/permissions/guards/permission.guard.ts
  apps/api/src/common/platform/guards/platform-admin.guard.ts
  apps/api/src/common/company/guards/company.guard.ts

Auth / JWT
  apps/api/src/auth/auth.service.ts
  apps/api/src/auth/strategies/jwt.strategy.ts

Onboarding tenant
  apps/api/src/company/company.service.ts      → POST /companies (self-service)
  apps/api/src/platform/platform.service.ts    → POST /platform/companies

Web guards
  apps/web/src/modules/auth/components/permission-guard.tsx
  apps/web/src/modules/auth/components/platform-guard.tsx
  apps/web/src/config/route-access.ts
  apps/web/src/config/nav.ts

Permisos compartidos
  packages/shared/src/auth/permissions.ts
  packages/shared/src/auth/permission-matrix.ts
```
