# Guia de Soft Delete en Modelos Administrativos

Este proyecto usa soft delete para master data (administrativo), no para entidades transaccionales o historicas.

## Alcance

Aplicar soft delete en modelos como:

- `Company`, `Branch`
- `User`, `Role`, `UserCompany`, `Employee`
- `Category`, `Product`, `Supplier`, `Customer`
- `Discount`, `CashRegister`

No aplicar soft delete en entidades como:

- `AuditLog`, `RefreshToken`
- `Inventory`, `InventoryMovement`
- `Sale`, `SaleItem`, `Payment`
- `PurchaseOrder`, `PurchaseOrderItem`
- `AccountReceivable`, `ReceivablePayment`, `AccountPayable`, `PayablePayment`
- `CashShift`, `Transfer`, `TransferItem`, `Return`, `ReturnItem`
- `NcfSequence` (usar `isActive = false`)

## 1) Cambios en Prisma Schema

En cada modelo administrativo, agregar:

```prisma
deletedAt DateTime?
```

Si el modelo ya tiene `isActive`, mantenerlo. `isActive` representa estado operativo, no eliminacion logica.

## 2) Uniques y soft delete

Si un campo era `@unique` y ahora el modelo usa soft delete, convertirlo a unico compuesto con `deletedAt`.

Ejemplo:

```prisma
model User {
  id         String    @id @default(cuid())
  email      String
  deletedAt  DateTime?

  @@unique([email, deletedAt])
}
```

Esto permite reutilizar valores unicos (email, slug, code) despues de eliminar logicamente un registro.

### Nota importante para PostgreSQL

En PostgreSQL, un `@@unique([campo, deletedAt])` con `deletedAt = NULL` puede permitir duplicados activos.
Para garantizar unicidad real entre activos, crear un indice unico parcial:

```sql
CREATE UNIQUE INDEX "User_email_active_key"
ON "User" ("email")
WHERE "deletedAt" IS NULL;
```

Mismo patron para `Company.slug`, `Role.name`, `UserCompany.userId` y cualquier nuevo modelo administrativo.

## 3) Importante: por que cambia `findUnique`

Porque al pasar de `@unique(email)` a `@@unique([email, deletedAt])`, `email` solo ya no es unico.

`findUnique` exige que el `where` use una clave realmente unica.
Ahora, para email, la clave unica es el par `email + deletedAt`.

Por eso esto ya no funciona:

```ts
prisma.user.findUnique({ where: { email } }); // ❌
```

Y esto si:

```ts
prisma.user.findUnique({
  where: {
    email_deletedAt: {
      email,
      deletedAt: null,
    },
  },
}); // ✅
```

O con helper:

```ts
prisma.user.findUnique({
  where: uniqueWithNotDeleted('email', email),
});
```

## 4) Registro en la configuracion central

Agregar el modelo en `packages/database/src/soft-delete/config.ts`:

- `SOFT_DELETE_MODELS`
- y si debe marcar `isActive = false` al eliminar logicamente, tambien en `SOFT_DELETE_MODELS_WITH_IS_ACTIVE`

## 5) Comportamiento esperado con la extension Prisma

### Query extension (infraestructura)

- Lecturas (`findMany`, `findFirst`, etc.) excluyen eliminados (`deletedAt: null`)
- Updates (`update`, `updateMany`, `upsert`) solo afectan registros no eliminados
- **`prisma.model.delete()` / `deleteMany()` están bloqueados** (error explícito)
- **`prisma.withDeleted(fn)`** o **`prisma.model.withDeleted(fn)`** desactivan el filtro global dentro del callback (auditoría, papelera, etc.)

### Model extension (dominio)

| Método                          | Efecto                                        | Modelos                             |
| ------------------------------- | --------------------------------------------- | ----------------------------------- |
| `softDelete` / `softDeleteMany` | `deletedAt = now`, opcional `isActive: false` | Todos en `SOFT_DELETE_MODELS`       |
| `restore` / `restoreMany`       | `deletedAt = null`                            | Todos en `SOFT_DELETE_MODELS`       |
| `activate` / `activateMany`     | `isActive = true`                             | `SOFT_DELETE_MODELS_WITH_IS_ACTIVE` |
| `deactivate` / `deactivateMany` | `isActive = false`                            | `SOFT_DELETE_MODELS_WITH_IS_ACTIVE` |

**Separación conceptual:**

- `restore`: revierte eliminación lógica (`deletedAt = null`). No cambia `isActive`.
- `activate` / `deactivate`: estado operativo (`isActive`). Un usuario puede estar suspendido (`isActive: false`, `deletedAt: null`) sin estar eliminado.

Tipado: operaciones unitarias → `Prisma.Result<...>`; `*Many` → `Prisma.BatchPayload`.

### `softDelete` y `softDeleteMany` — ejemplos de uso

**No uses** `prisma.model.delete()` ni `deleteMany()` en master data: la query extension lanza error. Usa siempre los métodos de model extension.

#### `softDelete` (un registro)

Equivalente a un `update` que pone `deletedAt = now()`. En `User`, `Company` y `Branch` también pone `isActive: false`.

```ts
import { prisma } from '@repo/db';

// Por id — devuelve el registro actualizado (inferencia según select/include)
const user = await prisma.user.softDelete({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    isActive: true,
    deletedAt: true,
  },
});

// Con include (misma forma que update)
const company = await prisma.company.softDelete({
  where: { id: companyId },
  include: { branches: true },
});

// Por clave compuesta unique + deletedAt (activos)
const role = await prisma.role.softDelete({
  where: {
    name_deletedAt: {
      name: 'CASHIER',
      deletedAt: null,
    },
  },
});
```

Después del soft delete, `findFirst` / `findMany` normales **no** devuelven ese registro (filtro global `deletedAt: null`).

#### `softDeleteMany` (varios registros)

Equivalente a `updateMany`. Solo afecta filas **no eliminadas** (el `where` se combina con `deletedAt: null`).

```ts
// Todas las membresías de un usuario en una empresa
const { count } = await prisma.userCompany.softDeleteMany({
  where: { userId, companyId },
});

if (count === 0) {
  // ninguna membresía activa coincidió
}

// Varias sucursales de una empresa
await prisma.branch.softDeleteMany({
  where: { companyId, isActive: true },
});

// Por lista de ids
await prisma.user.softDeleteMany({
  where: { id: { in: userIds } },
});
```

Retorno: `Prisma.BatchPayload` → `{ count: number }`.

#### Transacción (patrón recomendado en la API)

Los métodos funcionan dentro de `$transaction` usando `tx` (sin rebinding de delegates):

```ts
// Ejemplo real: DELETE /users/:id (apps/api/src/users/users.repository.ts)
await prisma.$transaction(async (tx) => {
  const membershipDelete = await tx.userCompany.softDeleteMany({
    where: { userId, companyId },
  });

  if (membershipDelete.count === 0) {
    return { status: 'membership_not_found' };
  }

  const user = await tx.user.softDelete({
    where: { id: userId },
    select: publicUserSelect,
  });

  return { status: 'ok', user };
});
```

#### Qué evitar

```ts
// ❌ Borrado físico — error explícito
await prisma.user.delete({ where: { id: userId } });

// ❌ No redirige a soft delete
await prisma.user.deleteMany({ where: { companyId } });

// ❌ update manual repetido en cada módulo (usa softDelete*)
await prisma.user.update({
  where: { id: userId },
  data: { deletedAt: new Date(), isActive: false },
});
```

#### Otros métodos (referencia rápida)

```ts
// Papelera / auditoría
await prisma.withDeleted(async () => {
  const deleted = await prisma.user.findMany({
    where: { deletedAt: { not: null } },
  });
});

// Restaurar usuario eliminado (en transacción; envolver en withDeleted)
await prisma.withDeleted(() =>
  prisma.$transaction(async (tx) => {
    await tx.userCompany.restoreMany({ where: { userId, companyId } });
    await tx.user.restore({ where: { id: userId }, select: publicUserSelect });
  }),
);

// Suspender sin eliminar (solo isActive)
await prisma.user.deactivate({ where: { id } });
await prisma.user.activate({ where: { id } });
```

## 6) Flujo recomendado para agregar un modelo nuevo

1. Agregar `deletedAt DateTime?` en el modelo Prisma.
2. Ajustar `@unique` a `@@unique([campo, deletedAt])` cuando aplique.
3. Registrar el modelo en `config.ts`.
4. Crear una migracion nueva (no editar una ya aplicada en entornos compartidos).
5. En PostgreSQL, agregar tambien indice unico parcial `WHERE deletedAt IS NULL` para unicidad en activos.
6. Ejecutar `prisma generate`.
7. Ajustar queries `findUnique` donde corresponda.
8. Validar que `delete` no borre fisicamente y que las lecturas normales no devuelvan eliminados.

## 7) Convencion para migraciones manuales

Cuando se crea una migracion SQL manual, usar carpeta con timestamp:

`YYYYMMDDHHmmss_nombre_descriptivo`

Ejemplo real:

`20260527110500_soft_delete_active_uniqueness`

Donde:

- `2026` anio
- `05` mes
- `27` dia
- `11` hora
- `05` minuto
- `00` segundo

En este proyecto, esa migracion agrego indices unicos parciales para activos y limpieza preventiva de duplicados activos.

## 8) Regla para migraciones (muy importante)

Regla correcta:

- No editar migraciones ya aplicadas en entornos compartidos.
- Para cambios nuevos, crear una migracion nueva.

### Caso ejemplo: nuevo modelo `Product`

Si agregas `Product` con soft delete, lo ideal es:

1. Actualizar `schema.prisma`.
2. Actualizar `config.ts` (listas de soft delete).
3. Crear una migracion nueva para ese cambio (incluyendo indice parcial unico activo).

No meterlo dentro de `20260527110500_soft_delete_active_uniqueness` si esa migracion ya existe o ya fue aplicada fuera de tu entorno local.

### Cuando si puedes editar una migracion existente

Solo si:

- es local,
- aun no se aplico en ningun entorno relevante,
- y estas corrigiendo antes de compartir.

## 9) Como se creo `20260527110500_soft_delete_active_uniqueness`

Se construyo manualmente en SQL porque Prisma schema no modela bien indices parciales con `WHERE deletedAt IS NULL`.

Proceso seguido:

1. Detectar el bug:
   - Se podian crear dos usuarios activos con el mismo email.
2. Disenar la solucion:
   - Indices unicos parciales para activos (`deletedAt IS NULL`).
   - Limpieza previa de duplicados activos para evitar fallo al crear indices.
3. Crear carpeta + archivo:
   - `packages/database/prisma/migrations/20260527110500_soft_delete_active_uniqueness/migration.sql`
4. Escribir SQL en 2 fases:
   - Fase A: `WITH ... ROW_NUMBER() ... UPDATE` para marcar duplicados como soft-deleted.
   - Fase B: `CREATE UNIQUE INDEX ... WHERE deletedAt IS NULL`.
5. Aplicar migracion:
   - `pnpm --filter @repo/db run db:deploy:dev`
6. Resolver fallo inicial:
   - Primera version fallo por colision de timestamp en cleanup.
   - Se ajusto `deletedAt` con milisegundos por fila (`NOW() + row_num ms`).
   - Se marco la migracion fallida como rolled back:
     - `pnpm exec prisma migrate resolve --rolled-back 20260527110500_soft_delete_active_uniqueness`
   - Se reaplico `db:deploy:dev`.
7. Validar:
   - Build y types en verde.
   - Unicidad activa funcionando como se espera.

## 10) Recomendacion practica para proximos modelos

Cada vez que agregues un modelo con soft delete + campo unico en activos, crea una migracion nueva con:

- cambios de tabla (`deletedAt`, etc.),
- indice parcial unico activo (`WHERE deletedAt IS NULL`),
- cleanup opcional si ya existe data duplicada en activos.
