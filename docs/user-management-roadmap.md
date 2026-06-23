# Gestión de usuarios — estado provisional y diseño objetivo

Este documento describe el **estado actual** de la pantalla y API de usuarios del tenant, y el **comportamiento objetivo** que debe implementarse para separar correctamente **Super Admin (plataforma)** y **Owner (empresa)**.

> **Importante:** la UI en `/users` y el CRUD tenant vía `GET|POST|PATCH|DELETE /users` son **provisionales**. No representan el modelo final de invitaciones, expulsiones ni creación cross-tenant.

Documentación relacionada:

- `docs/platform-admin-roadmap.md` — onboarding SaaS y roles de plataforma
- `docs/employee-user-registration-flow.md` — alta operativa (`POST /employees`)
- `apps/api/docs/auth-and-utilities.md` — endpoints `/users` vigentes
- `apps/web/ARCHITECTURE.md` — §18 Autenticación y RBAC

---

## Estado actual (provisional)

### Web (`apps/web`)

| Aspecto | Situación hoy |
| ------- | ------------- |
| Ruta | `/users` con tabla CRUD completa |
| Permisos UI | `<Can permission="users.*">` según JWT tenant |
| Diferenciación Super Admin vs Owner | **No implementada** — misma pantalla para cualquier rol con permiso |
| Invitaciones / enlaces mágicos | **No existen** |
| Expulsar vs eliminar | **No diferenciado** — la UI expone eliminar (`DELETE /users/:id`) si el rol tiene `users.delete` |

### API (`apps/api`)

| Aspecto | Situación hoy |
| ------- | ------------- |
| `POST /users` | Crea `User` + `UserCompany` en la empresa del JWT |
| `DELETE /users/:id` | Soft delete de **membresía y usuario global** (`UserCompany` + `User`) |
| Quién puede eliminar | Cualquier actor con permiso `users.delete` y jerarquía válida (p. ej. Owner si la matriz RBAC lo permite) |
| Super Admin en rutas tenant | **No bypass** en `PermissionGuard`; opera como cualquier usuario con membership si entra al tenant |

### Problemas conocidos del enfoque provisional

1. **Owner no debería poder eliminar usuarios globalmente**, pero hoy puede hacerlo si tiene `users.delete`.
2. **`DELETE /users/:id` no coordina con `Employee`**: si el usuario tenía empleado vinculado, el empleado queda huérfano (sin acceso, posible inconsistencia en UI). Ver discusión operativa en conversaciones de diseño.
3. **Super Admin** aún no tiene flujo dedicado de plataforma para crear tenants, owners iniciales ni usuarios sin contexto de empresa (`/platform/*` pendiente).
4. **Duplicidad conceptual** entre `/users` (usuario de equipo) y `/employees` (usuario operativo + datos laborales) sin guía clara en la UI.

---

## Diseño objetivo

### Dos actores, dos responsabilidades

| Actor | Alcance | Crear usuarios | Quitar acceso a la empresa | Eliminar cuenta global |
| ----- | ------- | -------------- | -------------------------- | ---------------------- |
| **Super Admin** (plataforma) | Cross-tenant | Sí — crea empresas, owner inicial y cuentas de plataforma | No es su rol habitual en tenant | Sí — operación de plataforma / cumplimiento |
| **Owner** (tenant) | Una `Company` | Sí — **invita** o crea miembros en **su** empresa | Sí — **expulsar** (revocar membresía) | **No** |

```text
SUPER_ADMIN  →  crea Company + primer OWNER; gestiona cuentas a nivel SaaS
OWNER        →  invita usuarios a su empresa; expulsa miembros; no borra User global
ADMIN        →  (futuro) subconjunto de gestión de equipo según jerarquía RBAC
```

### Super Admin — creación de usuarios

Objetivo cuando exista la capa `/platform/*`:

1. **Crear tenant:** `Company` + slug + estado.
2. **Crear owner inicial:** `User` + `UserCompany` con rol `OWNER` (sin pasar por pantalla tenant `/users`).
3. **Usuarios de plataforma:** cuentas con `isSuperAdmin` (o futuro `platformRole`) **sin** depender de `UserCompany` para operar el SaaS.
4. **No confundir** con el Owner: el Super Admin habilita el tenant; el Owner opera el día a día dentro de él.

Flujo de referencia: `docs/platform-admin-roadmap.md` (§ «Flujo futuro de onboarding»).

### Owner — invitar usuarios a su empresa

El Owner **no administra el SaaS**; administra **miembros de su equipo**:

| Acción objetivo | Comportamiento esperado |
| --------------- | ----------------------- |
| **Invitar / crear** | Alta de `User` (nuevo) o vincular email existente + `UserCompany` con rol asignable (`assert-assignable-role`) |
| **Editar rol / datos** | `PATCH /users/:id` dentro de la jerarquía |
| **Desactivar** | `isActive = false` — pierde login pero sigue existiendo la cuenta |
| **Expulsar** | Soft delete **solo** de `UserCompany` en esa empresa; revoca acceso al tenant; **no** soft delete de `User` |
| **Eliminar** | **Prohibido** para Owner — reservado a plataforma |

```text
Expulsar (Owner)                Eliminar (Super Admin / plataforma)
─────────────────               ───────────────────────────────────
UserCompany.deletedAt ✓         User.deletedAt ✓
User.isActive → false*          UserCompany.deletedAt ✓
User persiste                   Cuenta global retirada del sistema

* Desactivación de acceso; el registro User sigue en BD para auditoría / re-invite.
```

#### Expulsar vs desactivar

| Operación | Alcance | Reversible por Owner | Uso típico |
| --------- | ------- | -------------------- | ---------- |
| **Desactivar** | Usuario global (`User.isActive`) | Sí (`activate`) | Suspender login temporalmente |
| **Expulsar** | Membresía (`UserCompany`) | Re-invitar / restaurar membresía | Persona ya no pertenece a la empresa |
| **Eliminar** | Usuario + membresía (soft delete profundo) | Solo plataforma / restore admin | Baja definitiva de cuenta |

### Empleados (`POST /employees`)

Sigue siendo el flujo canónico para **personal operativo** (cajero, inventario, etc.): crea `User` + `UserCompany` + `Employee` en una transacción.

La pantalla `/users` objetivo debería **complementar**, no duplicar sin criterio, a `/employees`:

- **`/employees`:** RRHH + sucursal + operaciones (caja, ventas).
- **`/users` (futuro):** miembros del equipo con acceso al ERP (admin, manager) que **no** requieren ficha de empleado, o gestión unificada de membresías.

---

## Cambios pendientes (checklist)

### API

- [ ] Nuevo endpoint o semántica **`expel`** / `DELETE /users/:id/membership` — soft delete solo `UserCompany`, sin tocar `User`.
- [ ] Restringir **`DELETE /users/:id`** (delete global) a `@RequirePlatformAdmin()` o rol de plataforma explícito.
- [ ] Quitar `users.delete` del rol `OWNER` en matriz RBAC (`@repo/shared` + seed).
- [ ] Validar empleado vinculado al expulsar/desactivar (bloquear, cascada o desvincular explícitamente).
- [ ] Rutas `/platform/users` y `/platform/companies/:id/owner` para Super Admin.

### Web

- [ ] Marcar `/users` como provisional en navegación o banner dev hasta cerrar diseño.
- [ ] Ocultar «Eliminar» para Owner; mostrar «Expulsar de la empresa» cuando exista el endpoint.
- [ ] Pantalla de plataforma separada para Super Admin (no reutilizar CRUD tenant).
- [ ] Flujo de invitación (email / token) en lugar de solo «crear con contraseña».

### Documentación

- [x] Este documento (`docs/user-management-roadmap.md`).
- [ ] Actualizar matriz de permisos en `apps/api/docs/auth-and-utilities.md` cuando cambie RBAC.
- [ ] Cerrar §18 de `apps/web/ARCHITECTURE.md` cuando la UI deje de ser provisional.

---

## Referencia rápida para desarrolladores

```text
¿Es provisional?
  → Sí: módulo web `users`, DELETE global desde tenant, Owner con users.delete

¿Owner puede eliminar usuarios?
  → No (objetivo). Hoy puede si RBAC lo permite — tratar como deuda técnica.

¿Owner puede quitar a alguien de su empresa?
  → Sí, vía «expulsar» (futuro: solo UserCompany).

¿Super Admin crea usuarios como el Owner?
  → No. Super Admin: plataforma + onboarding tenant. Owner: invitaciones dentro del tenant.

¿Dónde creo un cajero?
  → POST /employees (no confundir con POST /users provisional).
```
