# Auth, Guards, Decorators y utilidades comunes

Guía de referencia para el backend `apps/api` (NestJS + Prisma, ERP multiempresa).

---

## Tabla de contenidos

1. [Visión general de Auth](#visión-general-de-auth)
2. [Flujo de autenticación](#flujo-de-autenticación)
3. [Contextos de request](#contextos-de-request)
4. [Guards](#guards)
5. [Decorators](#decorators)
6. [Acceso tenant (capas)](#acceso-tenant-capas)
7. [Utilidades de errores](#utilidades-de-errores)
8. [Multiempresa (tenant)](#multiempresa-tenant)
9. [Validación y respuestas API](#validación-y-respuestas-api)
10. [Observabilidad](#observabilidad)
11. [Ejemplos por módulo](#ejemplos-por-módulo)

---

## Visión general de Auth

El módulo de auth usa **dos tokens**:

| Token             | Duración | Transporte                             | Uso                         |
| ----------------- | -------- | -------------------------------------- | --------------------------- |
| **Access token**  | 15 min   | Header `Authorization: Bearer <token>` | Rutas protegidas (API)      |
| **Refresh token** | 7 días   | Cookie HTTP-only `refreshToken`        | Renovar sesión sin re-login |

El access token incluye claims de sesión tenant:

```typescript
type AccessTokenPayload = {
  sub: string; // userId
  email: string;
  companyId: string | null;
  branchId: string | null;
  role: RoleName | null;
  permissions: string[];
  isSuperAdmin: boolean;
};
```

En **login**, **refresh** e **issueAccessToken** (`switchBranch`) los claims se construyen desde BD (`findAuthContext`).

En cada request, `JwtStrategy.validate()` **revalida solo** `user.isActive` en BD; el resto de claims proviene del JWT (ventana de validez ~15 min si cambian permisos/rol en BD).

### Endpoints

| Método | Ruta            | Protección            | Descripción                                                       |
| ------ | --------------- | --------------------- | ----------------------------------------------------------------- |
| `POST` | `/auth/login`   | Pública               | Valida credenciales, devuelve `accessToken`, setea cookie refresh |
| `POST` | `/auth/refresh` | `JwtRefreshAuthGuard` | Renueva tokens usando cookie                                      |
| `POST` | `/auth/logout`  | `JwtRefreshAuthGuard` | Revoca refresh token y borra cookie                               |
| `GET`  | `/auth/session` | `@JwtAuth()`          | Sesión desde JWT (sin exigir empresa activa)                      |
| `GET`  | `/auth/profile` | `@JwtAuth()`          | Perfil básico desde BD (`firstName`, `lastName`)                  |
| `GET`  | `/auth/me`      | `@RequireCompany()`   | Devuelve `auth` + `company` del tenant activo                     |

### Login (sin Passport Local)

El login valida el body con `LoginDto` + `ValidationPipe` global **antes** de autenticar:

```typescript
@Post('login')
async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
  const user = await this.authService.validateUser(loginDto.email, loginDto.password);
  const { accessToken, refreshToken } = await this.authService.login(user);
  setRefreshTokenCookie(res, refreshToken);
  return { accessToken };
}
```

Errores típicos:

- Body inválido → `400 VALIDATION_ERROR`
- Credenciales malas → `401 INVALID_CREDENTIALS`

---

## Flujo de autenticación

```mermaid
sequenceDiagram
  participant Cliente
  participant API
  participant AuthService
  participant DB

  Cliente->>API: POST /auth/login { email, password }
  API->>AuthService: validateUser()
  AuthService->>DB: findByEmail + bcrypt.compare
  AuthService->>DB: storeRefreshToken + sign JWTs
  API-->>Cliente: { accessToken } + cookie refreshToken

  Cliente->>API: GET /recurso (Authorization: Bearer)
  API->>API: JwtAuthGuard → JwtStrategy.validate()
  JwtStrategy->>DB: isUserActive(userId)
  JwtStrategy->>API: AuthContext desde payload JWT
  API-->>Cliente: respuesta protegida
```

### Refresh token en base de datos

- Se guarda **hasheado** (bcrypt), no en texto plano.
- Soporta rotación: al refrescar, el token anterior se revoca y se crea uno nuevo.
- Logout revoca el token en BD.

---

## Contextos de request

Tras autenticación, Express expone estos campos (ver `src/types/express.d.ts`):

| Campo               | Cuándo existe                        | Tipo             | Contenido                    |
| ------------------- | ------------------------------------ | ---------------- | ---------------------------- |
| `request.user`      | Tras `JwtAuthGuard`                  | `AuthContext`    | Passport lo setea            |
| `request.auth`      | Tras `JwtAuthGuard` o `CompanyGuard` | `AuthContext`    | Alias estable para servicios |
| `request.company`   | Tras `CompanyGuard`                  | `CompanyContext` | Tenant activo                |
| `request.requestId` | Siempre (middleware)                 | `string`         | Trazabilidad                 |

### `AuthContext`

```typescript
type AuthContext = {
  userId: string;
  email: string;
  companyId: string | null;
  branchId: string | null;
  role: RoleName | null;
  permissions: string[];
  isSuperAdmin: boolean;
};
```

Se construye en login/refresh desde BD (`toAuthContext`) o en cada request desde el payload JWT (`toAuthContextFromPayload`).

> **Regla del schema:** un usuario tiene **como máximo una empresa** (`UserCompany.userId` es `@unique`).

### `CompanyContext`

```typescript
type CompanyContext = {
  companyId: string;
  branchId: string | null;
  role: RoleName;
};
```

Solo disponible cuando el usuario tiene membership **y** pasó `CompanyGuard`.

---

## Módulo `/me` (contexto del usuario)

Contexto del usuario autenticado (perfil, empresa, sucursal). **No** administra otros usuarios (eso es `/users`).

| Método  | Ruta                | Protección          | Descripción                                                                                |
| ------- | ------------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| `GET`   | `/me`               | `@RequireCompany()` | Perfil + membership en la empresa activa                                                   |
| `PATCH` | `/me`               | `@RequireCompany()` | Actualizar nombre/apellido propios                                                         |
| `PATCH` | `/me/password`      | `@JwtAuth()`        | Cambiar contraseña (revoca refresh tokens)                                                 |
| `GET`   | `/me/company`       | `@JwtAuth()`        | Empresa del usuario (única membership)                                                     |
| `GET`   | `/me/branch`        | `@RequireCompany()` | Sucursal por defecto (`defaultBranchId`)                                                   |
| `POST`  | `/me/switch-branch` | `@RequireCompany()` | Actualiza `defaultBranchId`; emite nuevo `accessToken`; sucursal destino debe estar activa |

> **Regla de dominio:** un usuario = una empresa. Una sucursal activa por sesión vía `defaultBranchId`. Para listar todas las sucursales del tenant, usar `GET /branches`.

### `/users` (administración — RBAC)

Todos los endpoints usan `@RequirePermissions(...)`. Jerarquía de roles en `src/users/helpers/assert-assignable-role.ts`.

> **Estado provisional:** este módulo API y la pantalla web `/users` no implementan aún el diseño objetivo de **invitar** (Owner) vs **eliminar cuenta global** (Super Admin) vs **expulsar** (revocar solo `UserCompany`). Hoy `DELETE /users/:id` hace soft delete de membresía **y** usuario global; cualquier rol con `users.delete` puede invocarlo. Ver `docs/user-management-roadmap.md`.

| Método   | Ruta                    | Permiso(s)         | Descripción                                                                 |
| -------- | ----------------------- | ------------------ | --------------------------------------------------------------------------- |
| `GET`    | `/users`                | `users.read`       | Listado paginado del equipo                                                 |
| `GET`    | `/users/roles`          | `users.read`       | Roles asignables por actor                                                  |
| `GET`    | `/users/:id`            | `users.read`       | Detalle de otro usuario                                                     |
| `POST`   | `/users`                | `users.create`     | Crear usuario en la empresa                                                 |
| `PATCH`  | `/users/:id`            | `users.update`     | Actualizar otro usuario                                                     |
| `PATCH`  | `/users/:id/activate`   | `users.activate`   | Activar                                                                     |
| `PATCH`  | `/users/:id/deactivate` | `users.deactivate` | Desactivar                                                                  |
| `PATCH`  | `/users/:id/restore`    | `users.update`     | Restaurar soft delete                                                       |
| `DELETE` | `/users/:id`            | `users.delete`     | Soft delete (global; **debe restringirse a plataforma** en diseño objetivo) |

#### Semántica objetivo (pendiente)

| Operación                  | Actor                     | Efecto                                              |
| -------------------------- | ------------------------- | --------------------------------------------------- |
| Invitar / crear en empresa | Owner (y roles delegados) | `User` + `UserCompany` en el tenant                 |
| Expulsar de la empresa     | Owner                     | Soft delete **solo** `UserCompany`; `User` persiste |
| Eliminar cuenta            | Super Admin (plataforma)  | Soft delete `User` + membresías                     |
| Desactivar login           | Owner / Admin             | `User.isActive = false`                             |

---

## Guards

Orden de ejecución en NestJS: **Middleware → Guards → Pipes → Controller**.

### `JwtAuthGuard`

- Archivo: `src/auth/guards/jwt-auth.guard.ts`
- Estrategia Passport: `jwt`
- Lee: `Authorization: Bearer <accessToken>`
- Ejecuta `JwtStrategy.validate()` → revalida `user.isActive` en BD; construye `AuthContext` desde payload JWT
- Setea: `request.auth = request.user`

**Cuándo usarlo:** rutas de sesión global o como primer guard en cadenas tenant.

```typescript
@JwtAuth()
@Get('session')
getSession(@Auth() auth: AuthContext) {
  return auth;
}
```

Alias: `@JwtAuth()` = `@UseGuards(JwtAuthGuard)`.

### `JwtRefreshAuthGuard`

- Archivo: `src/auth/guards/jwt-refresh-auth.guard.ts`
- Estrategia: `jwt-refresh`
- Lee refresh token desde **cookie** (no header)
- Setea `request.user` con `{ refreshTokenPayload, refreshTokenFromCookie }`

**Cuándo usarlo:** `/auth/refresh` y `/auth/logout`.

### `CompanyGuard` (capa 1 — empresa)

- Archivo: `src/common/company/guards/company.guard.ts`
- **Requiere JWT previo** (`JwtAuthGuard` debe ir antes)
- Valida:
  - Usuario autenticado
  - `companyId` presente (membership en JWT)
  - `role` presente
  - **`company.isActive === true` en BD** (`CompanyStatusRepository`)
- Setea: `request.auth` y `request.company`

**No aplica en:** `@JwtAuth()` ni `@RequireCompanyOwnerOrPlatformAdmin()`.

**Errores:**

| Caso              | HTTP | Código                        |
| ----------------- | ---- | ----------------------------- |
| Sin JWT           | 401  | `UNAUTHORIZED`                |
| Sin empresa / rol | 403  | `UNAUTHORIZED_COMPANY_ACCESS` |
| Empresa inactiva  | 403  | `UNAUTHORIZED_COMPANY_ACCESS` |

### `PermissionGuard` (RBAC tenant)

- Archivo: `src/common/permissions/guards/permission.guard.ts`
- **Requiere** `JwtAuthGuard` + `CompanyGuard` previos (vía `@RequirePermissions()`)
- Valida que `auth.permissions` del JWT incluya **todos** los permisos del decorador
- **No** hace bypass por `isSuperAdmin`

```typescript
@RequirePermissions('products.read')
@Get()
findAll(@CompanyId() companyId: string) { ... }
```

### `CompanyOwnerOrPlatformAdminGuard`

- Archivo: `src/common/company/guards/company-owner-or-platform-admin.guard.ts`
- Permite **OWNER** (con membership) o **SUPER_ADMIN** (flag en JWT)
- **No** valida `company.isActive` (reactivación / gestión de empresas suspendidas)
- Servicios deben usar `assertCompanyAccessOrPlatformAdmin` para evitar IDOR cross-tenant

### `PlatformAdminGuard`

- Archivo: `src/common/platform/guards/platform-admin.guard.ts`
- Implementado en rutas `/platform/*` (`@RequirePlatformAdmin()`)
- Solo valida `auth.isSuperAdmin`; **sin** `CompanyGuard` ni `PermissionGuard`

### `/platform` (administración SaaS)

Todos los endpoints usan `@RequirePlatformAdmin()` a nivel de controller.

| Método  | Ruta                                 | Descripción                           |
| ------- | ------------------------------------ | ------------------------------------- |
| `GET`   | `/platform/overview`                 | Totales de empresas activas/inactivas |
| `GET`   | `/platform/companies`                | Listado paginado cross-tenant         |
| `GET`   | `/platform/companies/:id`            | Detalle                               |
| `POST`  | `/platform/companies`                | Company + branch + owner              |
| `PATCH` | `/platform/companies/:id/activate`   | Reactivar tenant                      |
| `PATCH` | `/platform/companies/:id/deactivate` | Suspender tenant                      |

Ver también: `docs/platform-admin-roadmap.md`.

Ver revisión de riesgos y checklist: `docs/security-rbac-critical-review.md`.

### `BranchAccessService` (capa 2 — sucursal)

- Archivo: `src/branch/branch-access.service.ts`
- **No es un guard Nest**; se invoca en servicios/controllers branch-scoped
- Valida existencia de sucursal en empresa + **`branch.isActive === true`**
- Métodos: `assertBranchInCompany()`, `resolveBranchId()`

Ver guía detallada: [`tenant-access.md`](./tenant-access.md).

---

## Decorators

### `@Auth()` — contexto de usuario

- Archivo: `src/auth/decorators/auth.decorator.ts`
- Requiere: `request.auth` (normalmente vía `JwtAuthGuard`)
- Devuelve: `AuthContext`

```typescript
@RequireCompany()
@Get('orders')
list(@Auth() auth: AuthContext) {
  return this.ordersService.findByUser(auth);
}
```

### `@RequireCompany()` — tenant con empresa activa

- Archivo: `src/common/company/decorators/require-company.decorator.ts`
- Aplica: `@UseGuards(JwtAuthGuard, CompanyGuard)` en ese orden
- Incluye validación de **empresa activa** (capa 1)

```typescript
@RequireCompany()
@Get('products')
list(@CompanyId() companyId: string) {
  return this.productsService.findByCompany(companyId);
}
```

### `@RequirePermissions(...)` — tenant + RBAC

- Archivo: `src/common/permissions/decorators/require-permissions.decorator.ts`
- Aplica: `JwtAuthGuard` → `CompanyGuard` → `PermissionGuard`
- Uso estándar en controllers de negocio (`products`, `users`, `cash-registers`, etc.)

### `@RequireCompanyOwnerOrPlatformAdmin()` — gestión de Company

- Para `GET/PATCH/DELETE /companies/:id` (fuera del catálogo RBAC)
- OWNER de su empresa o SUPER_ADMIN de plataforma

### `@Company()` — contexto de tenant

- Devuelve: `CompanyContext` completo (`companyId`, `branchId`, `role`)
- Requiere: `CompanyGuard` previo

### `@CompanyId()` — solo el ID de empresa

- Devuelve: `string` (companyId activo)
- Útil para queries Prisma: `where: { companyId }`

---

## Acceso tenant (capas)

Documentación completa: **[`tenant-access.md`](./tenant-access.md)**.

Resumen:

| Tipo de módulo                                                             | Guards / servicios                            | ¿Depende de sucursal activa? |
| -------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------- |
| Catálogo (`products`, `categories`, `customers`, `suppliers`, `discounts`) | `@RequirePermissions`                         | **No** (company-wide)        |
| Branch-scoped (`cash-registers`, `employees` con `branchId`)               | `@RequirePermissions` + `BranchAccessService` | **Sí**                       |
| Gestión Company                                                            | `@RequireCompanyOwnerOrPlatformAdmin`         | No (permite reactivar)       |
| Sesión                                                                     | `@JwtAuth`                                    | No                           |

**Empleado ↔ sucursal:** operaciones como `openShift` usan `assertEmployeeForBranchOperation()` — el turno siempre queda asociado al empleado del usuario autenticado, activo y asignado a la sucursal operativa.

---

## Utilidades de errores

Import central:

```typescript
import {
  AuthException,
  BusinessException,
  InventoryException,
  ErrorCodes,
} from 'src/common/errors';
```

### Formato estándar de error

Toda respuesta de error pasa por `GlobalExceptionFilter`:

```json
{
  "success": false,
  "statusCode": 403,
  "message": "No tienes acceso a esta empresa",
  "error": "UNAUTHORIZED_COMPANY_ACCESS",
  "requestId": "5709f9be-fff3-4bb5-9cfe-1b6cabc3b0f7",
  "timestamp": "2026-05-26T16:22:43.853Z",
  "path": "/auth/me"
}
```

### Excepciones disponibles

| Clase                | Uso                         | Ejemplo                                                            |
| -------------------- | --------------------------- | ------------------------------------------------------------------ |
| `AuthException`      | Auth / sesión / empresa     | `AuthException.invalidCredentials()`                               |
| `BusinessException`  | Reglas de negocio genéricas | `BusinessException.notFound(ErrorCodes.CUSTOMER_NOT_FOUND, '...')` |
| `InventoryException` | Stock, productos, caja      | `InventoryException.insufficientStock('Tornillo M8')`              |

**No crear excepciones por módulo** (`SalesException`, etc.). Usar `BusinessException` + `ErrorCodes`.

### Factories de `AuthException`

```typescript
AuthException.invalidCredentials(); // 401 INVALID_CREDENTIALS
AuthException.unauthorized(); // 401 UNAUTHORIZED
AuthException.sessionExpired(); // 401 SESSION_EXPIRED
AuthException.unauthorizedCompanyAccess(); // 403 UNAUTHORIZED_COMPANY_ACCESS
```

### Factories de `InventoryException`

```typescript
InventoryException.insufficientStock('Producto X');
InventoryException.productNotFound(productId);
InventoryException.boxClosed();
```

### Prisma sin try/catch

El filter mapea automáticamente:

| Código Prisma     | HTTP | Error                                       |
| ----------------- | ---- | ------------------------------------------- |
| P2002 (unique)    | 409  | `EMAIL_ALREADY_EXISTS` o `DUPLICATE_RECORD` |
| P2025 (not found) | 404  | `RECORD_NOT_FOUND`                          |

```typescript
// ✅ Correcto: dejar propagar
await prisma.user.create({ data: { email, ... } });

// ❌ Evitar try/catch manual para P2002
```

### Códigos internos (`ErrorCodes`)

Ubicación: `src/common/errors/constants/error-codes.ts`

El frontend debe usar `error` (no el texto de `message`) para i18n y lógica:

```typescript
switch (response.error) {
  case ErrorCodes.INVALID_CREDENTIALS:
    // mostrar formulario de login
    break;
  case ErrorCodes.UNAUTHORIZED_COMPANY_ACCESS:
    // redirigir a onboarding de empresa
    break;
}
```

---

## Multiempresa (tenant)

### En controllers (capa HTTP)

**Catálogo y administración tenant** — `@RequirePermissions()`:

```typescript
import { CompanyId } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

@RequirePermissions('products.read')
@Get()
findAll(@CompanyId() companyId: string) {
  return this.productsService.findAll(companyId);
}
```

**Flujos branch-scoped** — además invocar `BranchAccessService`:

```typescript
const branchId = await this.branchAccessService.resolveBranchId(
  company.companyId,
  queryBranchId,
  company.branchId,
);
```

El módulo debe importar `AuthModule` (guards) y `BranchModule` si usa sucursales.

### En services (anti cross-tenant)

Siempre filtrar listados por `companyId` **y** validar recursos por ID:

```typescript
import { assertCompanyAccess } from 'src/common/company';
import type { AuthContext } from 'src/auth/auth.types';

async findOne(id: string, auth: AuthContext) {
  const product = await prisma.product.findUnique({ where: { id } });
  assertCompanyAccess(product?.companyId, auth.companyId);
  return product;
}
```

| Helper                                                     | Qué hace                                   |
| ---------------------------------------------------------- | ------------------------------------------ |
| `assertHasCompanyMembership(companyId)`                    | Falla 403 si no hay empresa                |
| `assertCompanyAccess(resourceCompanyId, currentCompanyId)` | Falla 403 si el recurso es de otra empresa |

> **Importante:** el guard evita usuarios sin tenant; `assertCompanyAccess` evita **IDOR cross-tenant** al cargar por ID.

---

## Validación y respuestas API

### ValidationPipe global

Configurado en `src/bootstrap/create-nest-app.ts`:

- `whitelist: true` — elimina campos no decorados
- `forbidNonWhitelisted: true` — 400 si el cliente manda campos extra
- `transform: true` — convierte tipos (query → number, etc.)

Errores de validación → `400 VALIDATION_ERROR` con `details[]` (solo en dev).

### Respuestas exitosas

`ResponseInterceptor` envuelve todo en:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

Si el handler devuelve `{ message: 'Sesión cerrada' }`, el interceptor usa ese mensaje y mueve el resto a `data`.

---

## Observabilidad

### `requestId`

- Middleware: `src/common/middlewares/observability.middleware.ts`
- Corre **antes** de guards (cubre 401/403/500)
- Header respuesta: `x-request-id`
- Body de error: campo `requestId` (para reportes del frontend)

El cliente puede enviar su propio ID:

```http
GET /auth/me
Authorization: Bearer <token>
x-request-id: soporte-ticket-12345
```

### Logs estructurados

Un log JSON por request en consola (`[Observability]`):

```json
{
  "requestId": "...",
  "method": "GET",
  "path": "/auth/me",
  "statusCode": 403,
  "durationMs": 12,
  "userId": "...",
  "companyId": "...",
  "errorCode": "UNAUTHORIZED_COMPANY_ACCESS"
}
```

Para errores 500, `GlobalExceptionFilter` agrega un log técnico complementario (Prisma code, stack en dev).

---

## Ejemplos por módulo

### Controller protegido con tenant

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import type { AuthContext } from 'src/auth/auth.types';
import { RequireCompany, CompanyId } from 'src/common/company';

@RequireCompany()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  list(@CompanyId() companyId: string) {
    return this.invoicesService.findAllByCompany(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Auth() auth: AuthContext) {
    return this.invoicesService.findOne(id, auth);
  }
}
```

### Service con reglas de negocio

```typescript
import { BusinessException, ErrorCodes, InventoryException } from 'src/common/errors';
import { assertCompanyAccess } from 'src/common/company';

async reserveStock(productId: string, qty: number, auth: AuthContext) {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  assertCompanyAccess(product?.companyId, auth.companyId);

  if (!product) {
    throw InventoryException.productNotFound(productId);
  }

  if (product.stock < qty) {
    throw InventoryException.insufficientStock(product.name);
  }

  // lógica de reserva...
}

async chargePayment(invoiceId: string) {
  const ok = await this.paymentGateway.charge(invoiceId);
  if (!ok) {
    throw new BusinessException(
      ErrorCodes.PAYMENT_FAILED,
      'No se pudo procesar el pago',
    );
  }
}
```

### DTO con validación

```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;
}
```

---

## Checklist para nuevos endpoints

- [ ] ¿Es público o requiere auth?
- [ ] ¿Es operación de tenant? → `@RequirePermissions()` (o `@RequireCompany()` si no hay permiso granular)
- [ ] ¿Es branch-scoped? → `BranchAccessService` + política empleado ↔ sucursal si aplica
- [ ] ¿Es catálogo company-wide? → no exigir sucursal activa (ver `tenant-access.md`)
- [ ] ¿Body/query validado con DTO + class-validator?
- [ ] ¿Listados filtrados por `companyId`?
- [ ] ¿Recursos por ID validados con `assertCompanyAccess`?
- [ ] ¿Errores de negocio con `AuthException` / `BusinessException` / `InventoryException`?
- [ ] ¿Prisma sin try/catch innecesario?

---

## Archivos clave

| Tema                      | Ruta                                                   |
| ------------------------- | ------------------------------------------------------ |
| **Acceso tenant (doc)**   | `docs/tenant-access.md`                                |
| Política capas (código)   | `src/common/tenant-access/`                            |
| Empleado ↔ sucursal       | `src/employees/policies/employee-branch.policy.ts`     |
| Auth controller           | `src/auth/auth.controller.ts`                          |
| Auth service              | `src/auth/auth.service.ts`                             |
| JWT strategy              | `src/auth/strategies/jwt.strategy.ts`                  |
| Refresh strategy          | `src/auth/strategies/jwt-refresh.strategy.ts`          |
| JwtAuthGuard / `@JwtAuth` | `src/auth/guards/`, `decorators/jwt-auth.decorator.ts` |
| Company guard/helpers     | `src/common/company/`                                  |
| Permission guard          | `src/common/permissions/`                              |
| Branch access             | `src/branch/branch-access.service.ts`                  |
| Jerarquía roles           | `src/users/helpers/assert-assignable-role.ts`          |
| Errores globales          | `src/common/errors/`                                   |
| Bootstrap app             | `src/bootstrap/create-nest-app.ts`                     |
| Seed permisos RBAC        | `packages/database/prisma/seed.ts`                     |
