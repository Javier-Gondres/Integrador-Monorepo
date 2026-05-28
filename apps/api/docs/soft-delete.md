# Guia de Soft Delete en Modelos Administrativos

Este proyecto usa soft delete para master data (administrativo), no para entidades transaccionales o historicas.

## Alcance

Aplicar soft delete en modelos como:

- `Company`
- `Branch`
- `User`
- `Role` (si aplica)
- `UserCompany`
- `Product`
- `Customer`
- `Supplier`

No aplicar soft delete en entidades como:

- `AuditLog`
- `RefreshToken`
- Facturas, ventas, pagos, movimientos de inventario

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
prisma.user.findUnique({ where: { email } }) // ❌
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
}) // ✅
```

O con helper:

```ts
prisma.user.findUnique({
  where: uniqueWithNotDeleted("email", email),
});
```

## 4) Registro en la configuracion central

Agregar el modelo en `packages/database/src/soft-delete/config.ts`:

- `SOFT_DELETE_MODELS`
- y si debe marcar `isActive = false` al eliminar logicamente, tambien en `SOFT_DELETE_MODELS_WITH_IS_ACTIVE`

## 5) Comportamiento esperado con la extension Prisma

La extension de soft delete aplica reglas automaticas:

- Lecturas (`findMany`, `findFirst`, etc.) excluyen eliminados (`deletedAt: null`)
- Updates (`update`, `updateMany`, `upsert`) solo afectan registros activos (`deletedAt: null`)
- **`prisma.model.delete()` / `deleteMany()` están bloqueados** en master data (error explícito; evita borrado físico accidental)
- Usar **`prisma.model.softDelete()`** y **`prisma.model.softDeleteMany()`** (model extension), compatibles con `$transaction(async (tx) => ...)`
- Tipado: `softDelete` → `Prisma.Result<...>`, `softDeleteMany` → `Prisma.BatchPayload`
- En modelos con `isActive`, el soft delete tambien pone `isActive: false`

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
