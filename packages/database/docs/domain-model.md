# Modelo de dominio ERP multiempresa

Documentación de referencia para implementar servicios en `apps/api` y módulos en `apps/web`. El schema fuente está en [`prisma/schema.prisma`](../prisma/schema.prisma) y [`prisma/models/`](../prisma/models/) (multi-archivo por dominio).

**Mercado objetivo:** República Dominicana (RNC, NCF DGII, RD$).

---

## Contexto para Cursor

- Cada **usuario** pertenece a **una sola empresa** activa (`UserCompany` con `@@unique([userId, deletedAt])`). La entidad `UserCompany` existe por diseño — ver [UserCompany por diseño](#usercompany-por-diseño).
- Una **empresa** tiene muchas **sucursales**; el **inventario** es por sucursal (`Inventory`: único por `branchId + productId`). `Inventory` es proyección; `InventoryMovement` es la fuente de verdad — ver [Inventario: proyección vs. historial](#inventario-proyección-vs-historial).
- **Nunca** actualices `Inventory.quantity` sin crear un `InventoryMovement` en la misma transacción.
- Operaciones críticas (venta, compra, transferencia, devolución, abonos) deben ir en **`prisma.$transaction`**.
- Master data usa **soft delete** — ver [Política de Soft Delete](#política-de-soft-delete). No uses `delete()` en esos modelos.
- `AuditLog` es append-only: registrar eventos importantes, sin borrado físico. Incluir `branchId` cuando la acción ocurra en una sucursal.

### Ejemplos de negocio (datos ficticios)

| Concepto                 | Ejemplo                                                                |
| ------------------------ | ---------------------------------------------------------------------- |
| Empresa                  | Ferretería García SRL — RNC `131234567`, slug `ferreteria-garcia`      |
| Sucursales               | Santiago (Av. Estrella Sadhalá), Santo Domingo (Zona Oriental)         |
| Producto                 | Coca-Cola 355 ml — código `BEB-001`, RD$ 45.00, proveedor Mercasid     |
| Categorías               | Bebidas, Refrescos (many-to-many con el producto)                      |
| Cliente consumidor final | Sin `customerId` en la venta, NCF tipo `CONSUMIDOR_FINAL`              |
| Cliente crédito          | Juan Pérez — cédula `00112345678`, venta RD$ 10,000 a 30 días          |
| Proveedor                | Induveca — compras registradas y `AccountPayable` si es a crédito       |
| NCF                      | Secuencia `B02`, consecutivos `B0200000001`, `B0200000002`…            |
| Caja                     | `Caja Principal` en sucursal Santiago — turno con apertura RD$ 2,000   |
| Descuento producto       | "Verano 20%" vinculado directamente a Coca-Cola                        |
| Descuento categoría      | "Bebidas 20%" en categoría Bebidas, excluyendo Coca-Cola 2L y Pepsi 2L |

---

## Reglas críticas de negocio

Decisiones que **no se deducen** solo leyendo los modelos Prisma. Obligatorias para cualquier servicio en `apps/api`.

### UserCompany por diseño

Aunque actualmente un usuario solo puede pertenecer a **una** empresa activa, se mantiene la entidad `UserCompany` para:

- Separar **identidad** (`User`) de **membresía empresarial** (`Company` + `Role`).
- Facilitar auditoría histórica de membresías desactivadas (soft delete en `UserCompany`).
- Permitir extensiones futuras (multi-empresa, cambio de empresa, roles distintos por contexto) sin migraciones disruptivas.

`User` responde _quién eres_; `UserCompany` responde _en qué empresa operas y con qué rol_. No colapsar ambos en un solo modelo.

### Inventario: proyección vs. historial

- **`Inventory`** es una **proyección** del stock **físico** por sucursal (`branchId + productId`).
- **`Reservation`** / **`ReservationItem`** bloquean disponibilidad sin mover stock físico — ver [Reservas de inventario](#reservas-de-inventario).
- **`InventoryMovement`** es la **fuente de verdad histórica** e inmutable de cada cambio físico.

Toda modificación de inventario debe, en la **misma transacción**:

1. Crear un `InventoryMovement`.
2. Actualizar `Inventory`.

**Prohibido:** `prisma.inventory.update(...)` sin registrar el movimiento correspondiente. Ese patrón rompe trazabilidad y conciliación de stock.

### Reservas de inventario

Una reserva es un **documento multiproducto** (`Reservation` + `ReservationItem`), alineado con `Sale`/`SaleItem`, `Purchase`/`PurchaseItem`, etc. Bloquea stock disponible sin modificar la existencia física ni generar `InventoryMovement`.

```text
stock físico     = Inventory.quantity
stock reservado  = SUM(ReservationItem.quantity WHERE Reservation.status = ACTIVE)
stock disponible = stock físico - stock reservado
```

**Ejemplo:** `Inventory.quantity = 100` de martillos. Reserva A (línea martillos = 20) + Reserva B (línea martillos = 15) → disponible = 65.

| Acción | Efecto |
|--------|--------|
| Crear reserva | `Reservation` + `ReservationItem`(s) con `status = ACTIVE`; `Inventory` sin cambios |
| Convertir en venta | `Sale.reservationId = reservation.id` + `Reservation.status = COMPLETED` + `SaleItem`(s) + `InventoryMovement(SALE)` + bajar `Inventory` (misma transacción) |
| Cancelar / expirar | `status = CANCELLED` o `EXPIRED`; disponible se libera |

**Prohibido:** usar `InventoryMovement` para reservas. Los movimientos representan solo cambios físicos reales (`PURCHASE`, `SALE`, `RETURN`, transferencias, `ADJUSTMENT`, `WASTE`).

Antes de vender o reservar, validar: `quantity solicitada <= stock disponible`.

### Descuentos

- Un descuento puede aplicarse a **productos específicos** (`Discount` ↔ `Product`).
- Un descuento puede aplicarse a **categorías completas** (`Discount` ↔ `Category`).
- Un descuento puede **excluir productos** mediante `DiscountExcludedProduct`.
- Si un producto califica por producto **y** por categoría, se aplica **únicamente el porcentaje más alto** (`max()`). Nunca sumar ni acumular descuentos.
- Los descuentos efectivos se **persisten en `SaleItem`** (`discountPercentage`, `discountAmount`) para preservar el histórico. Las ventas completadas no recalculan promociones vigentes hoy.

### Cuentas por cobrar y por pagar

**Ventas a crédito:**

```text
Sale → AccountReceivable → ReceivablePayment[]
```

**Compras a crédito:**

```text
Purchase → AccountPayable → PayablePayment[]
```

**Regla de balance:** los saldos **nunca** se calculan dinámicamente sumando pagos en cada consulta. El campo `balance` se actualiza dentro de la **misma transacción** que registra cada abono (`ReceivablePayment` / `PayablePayment`). Esto garantiza rendimiento con miles de pagos históricos.

### NCF (comprobantes fiscales DGII)

- `NcfSequence` administra la secuencia autorizada por DGII por empresa.
- `Sale` almacena el NCF emitido (`ncf`), su tipo (`ncfType`) y la referencia a la secuencia (`ncfSequenceId`) como snapshot histórico.
- El NCF emitido **nunca** debe modificarse después de completar una venta (`Sale.status = COMPLETED`).
- Las secuencias **no** usan soft delete; se desactivan con `isActive = false` para preservar historial fiscal.

### Modelos históricos (inmutables)

Estos modelos **nunca** usan soft delete. Los registros son inmutables; las correcciones se hacen mediante estados, movimientos compensatorios o nuevas transacciones — no borrando ni ocultando filas:

```text
Sale, SaleItem, Payment
InventoryMovement
AccountReceivable, ReceivablePayment
AccountPayable, PayablePayment
Purchase, PurchaseItem
CashShift
Transfer, TransferItem
Return, ReturnItem
Reservation, ReservationItem
AuditLog
```

`Inventory` tampoco usa soft delete: es proyección actualizada solo vía movimientos. Ver [Política de Soft Delete](#política-de-soft-delete) para el catálogo (master data).

---

## Política de Soft Delete

Mecanismo estándar: `deletedAt DateTime?`. Configuración en [`src/soft-delete/config.ts`](../src/soft-delete/config.ts). Guía de implementación en [`apps/api/docs/soft-delete.md`](../../../apps/api/docs/soft-delete.md).

**Regla general:** Master Data → soft delete. Histórico/transaccional → **nunca** soft delete.

**Regla arquitectónica:** Los catálogos pueden eliminarse lógicamente. Registros históricos y financieros nunca deben eliminarse (ni física ni lógicamente). Si una transacción deja de ser válida, cambiar de estado (`CANCELLED`, `REVERSED`, etc.) pero permanecer almacenada.

### Con soft delete (`deletedAt`)

| Modelo         | Motivo                                  |
| -------------- | --------------------------------------- |
| `Company`      | Empresa desactivada; mantener historial |
| `Branch`       | Sucursal cerrada                        |
| `User`         | Usuario deja de trabajar                |
| `Role`         | Rol obsoleto                            |
| `UserCompany`  | Membresía desactivada                   |
| `Employee`     | Empleado desvinculado                   |
| `Category`     | Categoría obsoleta                      |
| `Product`      | Producto descontinuado                  |
| `Supplier`     | Proveedor inactivo                      |
| `Customer`     | Cliente inactivo                        |
| `Discount`     | Promoción retirada                      |
| `CashRegister` | Caja fuera de servicio                  |

### Sin soft delete (histórico)

| Modelo                                   | Alternativa                                        |
| ---------------------------------------- | -------------------------------------------------- |
| `Inventory`, `InventoryMovement`         | Fuente de verdad del stock físico                  |
| `Reservation`, `ReservationItem`         | `ReservationStatus` (no mueve stock físico)        |
| `Sale`, `SaleItem`, `Payment`            | `SaleStatus` (`PENDING`, `COMPLETED`, `CANCELLED`) |
| `Purchase`, `PurchaseItem`               | Registro histórico inmutable                       |
| `AccountReceivable`, `ReceivablePayment` | `ReceivableStatus`                                 |
| `AccountPayable`, `PayablePayment`       | `PayableStatus`                                    |
| `CashShift`                              | `closedAt` / arqueo histórico                      |
| `Transfer`, `TransferItem`               | `TransferStatus`                                   |
| `Return`, `ReturnItem`                   | Registro permanente                                |
| `NcfSequence`                            | `isActive = false` si deja de usarse               |
| `AuditLog`                               | Append-only                                        |
| `RefreshToken`                           | `revoked` + `revokedAt`                            |

### Uniques con soft delete

Todo `@unique` en master data debe incluir `deletedAt`:

```prisma
// Incorrecto
email String @unique

// Correcto
@@unique([email, deletedAt])
@@unique([companyId, code, deletedAt])
@@unique([companyId, cedula, deletedAt])
@@unique([companyId, name, deletedAt])
```

### Índices

Todo modelo con soft delete incluye `@@index([deletedAt])`.

---

## Estructura organizacional

### `Company`

Empresa propietaria: datos fiscales, catálogo maestro, clientes, proveedores, secuencias NCF.

| Campo                   | Uso                                 |
| ----------------------- | ----------------------------------- |
| `name`, `slug`          | Identificación y rutas multi-tenant |
| `rnc`                   | Registro nacional del contribuyente |
| `email`, `phone`        | Contacto                            |
| `isActive`, `deletedAt` | Soft delete                         |

**Relaciones:** `branches`, `products`, `customers`, `suppliers`, `ncfSequences`, `discounts`, `users` (vía `UserCompany`).

**Ejemplo:** Comercial Martínez SRL registra productos y secuencias NCF; las sucursales operan ventas e inventario local.

---

### `Branch`

Sucursal física: inventario, ventas, compras, cajas, transferencias.

| Campo                   | Uso                      |
| ----------------------- | ------------------------ |
| `companyId`             | Pertenencia a la empresa |
| `name`, `address`       | Identificación           |
| `isActive`, `deletedAt` | Soft delete              |

**Ejemplo:** Sucursal La Vega con su propio stock de herramientas y su `CashRegister` "Caja 1".

---

## Seguridad y personal

### `User`

Credenciales: login, contraseña (`passwordHash`), sesiones (`RefreshToken`).

**Ejemplo:** `maria@ferreteria.com` — no implica que sea cajera; puede ser solo administradora.

---

### `Role` / `RoleName`

Roles del sistema: `OWNER`, `ADMIN`, `MANAGER`, `CASHIER`, `INVENTORY_ASSISTANT`.

---

### `UserCompany`

Vincula un usuario a **una** empresa y un rol. Existe por diseño — ver [UserCompany por diseño](#usercompany-por-diseño).

| Campo                               | Uso                                          |
| ----------------------------------- | -------------------------------------------- |
| `defaultBranchId` / `defaultBranch` | Sucursal por defecto en UI (relación Prisma) |

**Regla:** Un usuario activo solo tiene una membresía (`@@unique([userId, deletedAt])`). La restricción actual es de negocio, no de modelo: `UserCompany` no sobra.

---

### `Employee`

Empleado operativo: siempre ligado a `User`, `Company` y `Branch`.

| Campo                                   | Uso                                 |
| --------------------------------------- | ----------------------------------- |
| `position`                              | Cargo                               |
| `salary`, `hireDate`, `terminationDate` | Datos laborales                     |
| `userId`                                | `@unique` — un empleado por usuario |

**Ejemplo:** Carlos es `CASHIER` en sucursal Santiago; sus ventas usan `cashierId = Employee.id`.

---

### `RefreshToken`

Tokens de refresco de sesión. No usar soft delete.

---

## Catálogo (nivel empresa)

### `Category`

Clasificación de productos. Relación **many-to-many** implícita con `Product`.

**Ejemplo:** Coca-Cola en categorías Bebidas, Refrescos y Promociones.

---

### `Product`

Artículo vendible/comprable por empresa.

| Campo   | Uso                                                          |
| ------- | ------------------------------------------------------------ |
| `code`  | Único por empresa (`@@unique([companyId, code, deletedAt])`) |
| `price` | Precio de referencia / lista                                 |

Los proveedores del producto se modelan en `ProductSupplier` (M:N). Un mismo artículo puede abastecerse de varios proveedores; `isPreferred` marca el preferido para compras.

El stock real vive en `Inventory` por sucursal.

---

### `ProductSupplier`

Vínculo explícito producto ↔ proveedor (`@@id([productId, supplierId])`).

| Campo          | Uso                                              |
| -------------- | ------------------------------------------------ |
| `isPreferred`  | Proveedor preferido al generar órdenes de compra |
| `lastCost`     | Último costo registrado con ese proveedor        |

**Regla:** por cada producto solo puede existir un `ProductSupplier` con `isPreferred = true`. Esta restricción está protegida tanto por lógica de aplicación como por un índice parcial único en PostgreSQL (`product_supplier_preferred_idx`).

**Implementación en servicios:** al marcar un proveedor como preferido:

1. Desmarcar cualquier otro proveedor preferido del mismo `productId`.
2. Marcar el nuevo vínculo con `isPreferred = true`.
3. Ejecutar ambos pasos en la **misma transacción**.

El índice parcial actúa como protección final contra errores de código, concurrencia o modificaciones directas en la base de datos.

**Ejemplo:** Coca-Cola 355 ml la venden Bebidas Caribeña (preferido) y Distribuidora Nacional (alternativo).

---

### `Supplier`

Proveedor: compras y cuentas por pagar.

**Ejemplo:** Mercasid suministra abarrotes; `Purchase` y `AccountPayable` apuntan aquí. Los productos que ofrece se listan vía `ProductSupplier`.

---

### `Customer`

Cliente del sistema: **únicamente personas físicas**.

| Campo                       | Uso          |
| --------------------------- | ------------ |
| `firstName`, `lastName`     | Obligatorios |
| `cedula`                    | Opcional     |
| `email`, `phone`, `address` | Contacto     |

**Válidos:** Juan Pérez, María Rodríguez, Pedro Gómez.

**Inválidos:** Ferretería XYZ, Comercial García, Ministerio de Educación (no son personas).

Sin `customerId` en la venta = consumidor final en POS.

**Ejemplo:**

```json
{ "firstName": "Juan", "lastName": "Pérez", "cedula": "00112345678" }
```

---

### `Discount`

Ver también [Descuentos](#descuentos).

Promoción por **porcentaje** a nivel empresa. Modelo independiente:

```text
Discount ←→ Product          (productos incluidos directamente)
Discount ←→ Category         (categorías incluidas)
Discount ←→ DiscountExcludedProduct ←→ Product   (exclusiones)
```

| Campo / relación       | Uso                                                                 |
| ---------------------- | ------------------------------------------------------------------- |
| `percentage`           | Porcentaje (ej. 20.00 = 20%)                                        |
| `startDate`, `endDate` | Vigencia opcional (indexados para consultas de promociones activas) |
| `products`             | Productos con descuento directo                                     |
| `categories`           | Categorías completas con descuento                                  |
| `excludedProducts`     | Productos excluidos de **este** descuento                           |

**Ejemplos de configuración:**

```text
Descuento "Verano 20%" → Producto Coca-Cola 355ml
Descuento "Bebidas 20%" → Categoría Bebidas
  Exclusiones: Coca-Cola 2L, Pepsi 2L
```

Un descuento por categoría aplica a todos los productos de esa categoría **excepto** los listados en `DiscountExcludedProduct`.

### `DiscountExcludedProduct`

Vincula un descuento con un producto excluido. Único por `(discountId, productId)`.

**Ejemplo:** "Bebidas 20%" aplica a toda la categoría, pero Coca-Cola 2L y Pepsi 2L quedan fuera.

#### Regla de cálculo al vender (por línea)

1. Obtener descuentos **activos** vinculados directamente al producto.
2. Obtener descuentos **activos** de **todas** las categorías del producto.
3. **Eliminar** descuentos donde el producto aparezca en `DiscountExcludedProduct` de ese descuento.
4. Combinar los porcentajes restantes.
5. Seleccionar **únicamente el más alto**: `max(20, 10, 15) = 20%`.
6. Aplicar solo ese porcentaje sobre la línea.
7. Persistir `discountPercentage` y `discountAmount` en `SaleItem`.

**Prohibido:** sumar, acumular, multiplicar o aplicar varios descuentos a la vez.

**Ejemplo con exclusión:** Coca-Cola 2L (categoría Bebidas) con descuento categoría 20% pero excluido → no recibe ese 20%. Si tiene descuento directo 10%, aplica 10%.

**Ejemplo sin exclusión:** Coca-Cola 355ml con 20% (producto) y 15% (categoría Bebidas) → aplica 20%, subtotal RD$ 80 sobre precio RD$ 100.

#### Snapshot histórico

Al completar la venta, persistir en `SaleItem` el descuento aplicado. Las ventas históricas **nunca** recalculan promociones actuales.

---

## Inventario (nivel sucursal)

Ver también [Inventario: proyección vs. historial](#inventario-proyección-vs-historial).

### `Inventory`

**Proyección** del stock **físico** actual: **un registro por** `(branchId, productId)`. No incluye reservas; se deriva de `InventoryMovement`.

**Ejemplo:** Santiago 50 unidades físicas de `BEB-001`. Si hay 10 reservadas activas, el disponible para vender es 40.

---

### `Reservation` / `ReservationItem`

Documento de reserva multiproducto. Consistente con el patrón cabecera/líneas del ERP (`Sale`/`SaleItem`, `Purchase`/`PurchaseItem`, etc.).

**`Reservation`** — cabecera del documento:

| Campo                 | Uso                                              |
| --------------------- | ------------------------------------------------ |
| `companyId`, `branchId` | Alcance multiempresa / sucursal                |
| `customerId`          | Cliente opcional                                 |
| `createdByEmployeeId` | Empleado que registró la reserva                 |
| `expiresAt`           | Vencimiento opcional                             |
| `status`              | `ACTIVE`, `COMPLETED`, `CANCELLED`, `EXPIRED`    |

**`ReservationItem`** — cada producto reservado:

| Campo        | Uso                    |
| ------------ | ---------------------- |
| `productId`  | Producto reservado     |
| `quantity`   | Unidades bloqueadas    |

**Trazabilidad con ventas:** `Reservation` 1 ── N `Sale` vía `Sale.reservationId` (opcional). Solo auditoría; no afecta disponibilidad ni inventario. Una reserva puede originar varias ventas (p. ej. consumos parciales futuros).

**No genera** `InventoryMovement`. Ver [Reservas de inventario](#reservas-de-inventario).

---

### `InventoryMovement`

Historial inmutable de cambios de stock.

| `InventoryMovementType`        | Origen típico                  |
| ------------------------------ | ------------------------------ |
| `PURCHASE`                     | Recepción de compra            |
| `SALE`                         | Venta completada               |
| `RETURN`                       | Devolución                     |
| `TRANSFER_OUT` / `TRANSFER_IN` | Transferencia entre sucursales |
| `ADJUSTMENT`                   | Ajuste manual autorizado       |
| `WASTE`                        | Merma / vencimiento            |

Campos opcionales de trazabilidad: `saleId`, `purchaseId`, `returnId`, `transferId`, `performedByEmployeeId`.

| Responsable                                          | Regla                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| `ADJUSTMENT`, `WASTE`, `TRANSFER_OUT`, `TRANSFER_IN` | `performedByEmployeeId` **obligatorio**                                |
| `SALE`, `PURCHASE`, `RETURN`                         | Opcional; inferir desde `Sale.cashierId`, compra o `Return.employeeId` |

**Regla de oro:** Toda variación de `Inventory.quantity` debe tener su `InventoryMovement` correspondiente.

---

## Ventas y pagos

### `Sale`

Cabecera de venta en una sucursal.

| Campo                             | Uso                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `status`                          | `PENDING` → `COMPLETED` o `CANCELLED`                                           |
| `reservationId`                   | Reserva de origen (opcional; solo trazabilidad/auditoría)                       |
| `cashierId`                       | `Employee` que opera la venta                                                   |
| `cashShiftId`                     | Turno de caja abierto (opcional pero recomendado en POS)                        |
| `ncf`, `ncfType`, `ncfSequenceId` | Comprobante fiscal; `ncfType` es snapshot histórico (reportes B01/B02 sin join) |
| `subtotal`, `taxAmount`, `total`  | Montos en RD$                                                                   |

---

### `SaleItem`

Línea: producto, cantidad, precio unitario, descuento aplicado y subtotal.

| Campo                | Uso                                              |
| -------------------- | ------------------------------------------------ |
| `unitPrice`          | Precio de lista al momento de la venta           |
| `discountPercentage` | Snapshot del % aplicado (ej. 20.00)              |
| `discountAmount`     | Snapshot del monto descontado en RD$ (ej. 20.00) |
| `subtotal`           | Total de línea **después** del descuento         |

**Ejemplo:** Producto RD$ 100, descuento 20% → `discountPercentage = 20`, `discountAmount = 20`, `subtotal = 80`.

**Regla:** consultas e informes de ventas históricas usan estos campos; no recalculan `Discount` vigente hoy.

---

### `Payment`

Una venta puede tener **varios** pagos (efectivo + tarjeta). La venta mixta se modela con múltiples registros `Payment`, **no** con un método `MIXED`.

| `PaymentMethod`            | Uso                                     |
| -------------------------- | --------------------------------------- |
| `CASH`, `CARD`, `TRANSFER` | Contado                                 |
| `CREDIT`                   | Dispara creación de `AccountReceivable` |

**Ejemplo venta mixta (Venta #1001):**

```text
Payment 1: CASH  — RD$ 500
Payment 2: CARD  — RD$ 1,000
Total venta: RD$ 1,500
```

Relación: `Sale` 1 ──── N `Payment`.

---

## Facturación fiscal

Ver también [NCF (comprobantes fiscales DGII)](#ncf-comprobantes-fiscales-dgii).

### `NcfSequence`

Secuencia autorizada DGII por empresa. **Sin soft delete** — preservar historial fiscal; desactivar con `isActive = false`.

| Campo                        | Uso                                     |
| ---------------------------- | --------------------------------------- |
| `isActive`                   | Desactivar secuencia obsoleta o agotada |
| `currentNumber`, `maxNumber` | Control de consecutivos                 |

| `NcfType`                                          | Uso típico                                                                             |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `CONSUMIDOR_FINAL`                                 | B02 — venta al público                                                                 |
| `CREDITO_FISCAL`                                   | B01 — casos fiscales específicos (no aplica a clientes empresa; clientes son personas) |
| `GUBERNAMENTAL`, `REGIMEN_ESPECIAL`, `EXPORTACION` | Según régimen                                                                          |

Antes de completar venta fiscal:

1. Obtener secuencia activa (`isActive`, no vencida, `currentNumber < maxNumber`).
2. Incrementar `currentNumber` (en transacción).
3. Formar NCF: `prefix` + número con padding (ej. `B0200000001`).
4. Guardar en `Sale.ncf`, `Sale.ncfType` y `Sale.ncfSequenceId`.

**Inmutabilidad:** una vez `Sale.status = COMPLETED`, `ncf`, `ncfType` y `ncfSequenceId` no se modifican. Correcciones fiscales requieren flujos compensatorios (nota de crédito, anulación con reversión), no edición del NCF original.

---

## Compras

El sistema **no gestiona órdenes de compra**. No existen borradores, aprobaciones ni recepciones pendientes. Solo se registran **compras ya recibidas** cuando la mercancía llega al negocio.

### Flujo de negocio

```text
Proveedor entrega mercancía
        ↓
Empleado registra la compra
        ↓
Se crean Purchase y PurchaseItem
        ↓
Se crean InventoryMovement tipo PURCHASE
        ↓
Se actualiza Inventory
        ↓
Si quedó pendiente de pago:
        ↓
AccountPayable
```

---

### `Purchase`

Registro de una compra ya recibida en una sucursal.

| Campo                  | Uso                                                        |
| ---------------------- | ---------------------------------------------------------- |
| `branchId`             | Sucursal que recibió la mercancía                          |
| `supplierId`           | Proveedor que entregó                                      |
| `invoiceNumber`        | Número de factura del proveedor (opcional)                 |
| `invoiceDate`          | Fecha de la factura del proveedor (opcional)               |
| `receivedByEmployeeId` | Empleado que registró la recepción (opcional)              |
| `subtotal`, `taxAmount`, `total` | Montos en RD$                                   |

**Relaciones:** `PurchaseItem[]`, `InventoryMovement[]`, `AccountPayable?` (si quedó a crédito), `receivedBy` → `Employee`.

`createdAt` registra cuándo se ingresó al sistema; `invoiceDate` es la fecha fiscal/documental del proveedor (pueden diferir).

---

### `PurchaseItem`

Detalle de la compra: producto, cantidad, costo unitario, subtotal.

---

## Caja

### `CashRegister`

Caja física por sucursal (ej. "Caja 1", "Caja Principal").

---

### `CashShift`

Turno de un cajero en una caja.

| Campo                   | Uso                    |
| ----------------------- | ---------------------- |
| `openingAmount`         | Fondo de caja al abrir |
| `closingAmount`         | Contado al cerrar      |
| `openedAt` / `closedAt` | Tiempos del turno      |

**Estados derivados (lógica de servicio, no enum en schema hoy):**

| Estado   | Condición                                       |
| -------- | ----------------------------------------------- |
| `OPEN`   | `closedAt == null`                              |
| `CLOSED` | `closedAt != null` y `closingAmount` registrado |

---

## Cuentas por cobrar / pagar

Ver también [Cuentas por cobrar y por pagar](#cuentas-por-cobrar-y-por-pagar).

```text
Ventas a crédito:   Sale → AccountReceivable → ReceivablePayment[]
Compras a crédito:  Purchase → AccountPayable → PayablePayment[]
```

**Balance:** `balance` se mantiene actualizado en la misma transacción de cada abono. No recalcular sumando pagos en consultas de listado o reportes.

### `AccountReceivable`

Generada en venta a crédito (`Payment` con `CREDIT` o flujo sin pago contado según reglas de negocio).

| Campo            | Uso                                           |
| ---------------- | --------------------------------------------- |
| `originalAmount` | Deuda inicial (= total a crédito de la venta) |
| `balance`        | Saldo pendiente                               |
| `dueDate`        | Vencimiento                                   |
| `status`         | `ReceivableStatus` persistido                 |

| `ReceivableStatus` | Condición                       |
| ------------------ | ------------------------------- |
| `OPEN`             | Sin pagos registrados           |
| `PARTIAL`          | Tiene pagos y `balance > 0`     |
| `PAID`             | `balance == 0`                  |
| `OVERDUE`          | `balance > 0` y `dueDate < hoy` |

Recalcular `status` después de cada `ReceivablePayment` (y en jobs de vencimiento para `OVERDUE`).

---

### `ReceivablePayment`

Abono que reduce `balance`. Validar que `amount <= balance`.

| Campo    | Uso                                                |
| -------- | -------------------------------------------------- |
| `method` | `CASH`, `CARD` o `TRANSFER` (cómo pagó el cliente) |
| `amount` | Monto del abono                                    |

---

### `AccountPayable` / `PayablePayment`

Análogo con proveedores cuando la compra queda a crédito. `purchaseId` es único por cuenta.

| `PayableStatus` | Condición                       |
| --------------- | ------------------------------- |
| `OPEN`          | Sin pagos registrados           |
| `PARTIAL`       | Tiene pagos y `balance > 0`     |
| `PAID`          | `balance == 0`                  |
| `OVERDUE`       | `balance > 0` y `dueDate < hoy` |

Recalcular `status` después de cada `PayablePayment`.

| Campo en `PayablePayment` | Uso                                                     |
| ------------------------- | ------------------------------------------------------- |
| `method`                  | `CASH`, `CARD` o `TRANSFER` (cómo se pagó al proveedor) |
| `amount`                  | Monto del pago                                          |

---

## Devoluciones y transferencias

### `Return` / `ReturnItem`

Devolución en sucursal; opcionalmente ligada a `Sale`.

| `ReturnReason` | Ejemplo                          |
| -------------- | -------------------------------- |
| `DEFECTIVE`    | Producto dañado                  |
| `SALES_ERROR`  | Cobro o producto equivocado      |
| `EXPIRED`      | Vencido                          |
| `OTHER`        | Otro motivo (detalle en `notes`) |

---

### `Transfer` / `TransferItem`

Movimiento entre sucursales (`fromBranchId` → `toBranchId`).

| `TransferStatus` | Flujo                |
| ---------------- | -------------------- |
| `PENDING`        | Creada               |
| `IN_TRANSIT`     | Enviada desde origen |
| `COMPLETED`      | Recibida en destino  |
| `CANCELLED`      | Anulada              |

---

## Auditoría

### `AuditLog`

Registro append-only: `action`, `entity`, `entityId`, `metadata` (JSON), `companyId`, `userId`, `branchId`.

Relaciones: `user` (quién ejecutó la acción), `branch` (sucursal donde ocurrió).

Incluir `branchId` cuando la acción ocurra en sucursal: ventas, compras, transferencias, caja, inventario.

**Ejemplo:**

```json
{
  "action": "SALE_CREATED",
  "companyId": "cmp_001",
  "branchId": "br_002",
  "userId": "usr_001"
}
```

---

## Flujos de servicio (implementación obligatoria)

Todos los pasos de un flujo deben ejecutarse en **una transacción** salvo consultas de solo lectura. Si un paso falla, hacer rollback completo.

### Venta al contado

1. Crear `Sale` con `status = PENDING` (validar `cashShift` abierto si aplica POS).
2. Crear `SaleItem`(s): calcular descuento (producto + categorías − exclusiones → `max()`), persistir `discountPercentage`, `discountAmount` y `subtotal`; calcular totales de cabecera.
3. Crear `Payment`(s) — métodos distintos de `CREDIT`; la suma debe igualar el `total`.
4. Por cada ítem: validar stock en `Inventory` de la sucursal; **descontar** cantidad.
5. Crear `InventoryMovement` tipo `SALE` por producto (cantidad positiva en movimiento = unidades salidas; documentar convención de signo en el servicio y ser consistente).
6. Generar NCF (incrementar `NcfSequence`, asignar `Sale.ncf`).
7. Marcar `Sale.status = COMPLETED`.
8. Registrar `AuditLog` con `companyId` y `branchId`.

**Ejemplo:** RD$ 500 efectivo + RD$ 1,000 tarjeta en una venta de RD$ 1,500 → dos registros `Payment`.

---

### Venta a crédito

1. Crear `Sale` (`PENDING`) con `customerId` obligatorio (persona física registrada).
2. Crear `SaleItem`(s) con snapshot de descuento y totales.
3. **No** crear `Payment` contado (o crear un único `Payment` con `method = CREDIT` por el monto total, según convención del módulo).
4. Descontar `Inventory` y crear `InventoryMovement(SALE)` por ítem.
5. Generar NCF (típicamente `CONSUMIDOR_FINAL` en POS).
6. Crear `AccountReceivable`: `originalAmount` y `balance` = monto a crédito, `dueDate` según política, `status = OPEN`.
7. `Sale.status = COMPLETED`.
8. `AuditLog` con `branchId`.

**Ejemplo:** Cliente Juan — RD$ 10,000 a 30 días; `balance` inicial 10,000.

---

### Abono de cuenta por cobrar

1. Validar `AccountReceivable` con `balance > 0`.
2. Crear `ReceivablePayment` con `amount` y `method`.
3. Reducir `balance` (`balance = balance - amount`).
4. Recalcular `status`: `PAID` si `balance == 0`; `PARTIAL` si hay pagos y saldo pendiente; `OVERDUE` si vencida.
5. Rechazar abonos que excedan el saldo.
6. `AuditLog`.

**Ejemplo:** Abono RD$ 3,000 → balance pasa de 10,000 a 7,000.

---

### Registro de compra (recepción de mercancía)

1. Crear `Purchase` y `PurchaseItem`(s) con los productos recibidos.
2. Por ítem: **aumentar** `Inventory` en la sucursal (crear fila si no existe).
3. Crear `InventoryMovement(PURCHASE)` vinculado a `purchaseId`.
4. Si es **a crédito**: crear `AccountPayable` con `originalAmount`, `balance`, `dueDate` y `status = OPEN`.
5. Si es contado: registrar pago al proveedor fuera de CxP o con `PayablePayment` inmediato (actualizar `status = PAID`).
6. `AuditLog` con `branchId`.

Todo en **una transacción**. No existen compras pendientes de recepción.

**Ejemplo:** Induveca entrega mercancía por RD$ 50,000 — el empleado registra la compra, sube el stock y queda CxP si no se pagó al contado.

---

### Transferencia entre sucursales

1. Validar stock suficiente en sucursal **origen** (`fromBranchId`).
2. Crear `Transfer` + `TransferItem`(s) (`PENDING` o `IN_TRANSIT`).
3. Descontar inventario origen; `InventoryMovement(TRANSFER_OUT)` con `transferId` y `performedByEmployeeId`.
4. Aumentar inventario destino; `InventoryMovement(TRANSFER_IN)` con el mismo `transferId` y `performedByEmployeeId`.
5. Actualizar ambos `Inventory` en la misma transacción.
6. `Transfer.status = COMPLETED` al confirmar recepción.
7. `AuditLog`.

**Ejemplo:** 20 Coca-Colas de Santiago → Santo Domingo.

---

### Reserva de inventario

1. Calcular disponible por producto: `Inventory.quantity - SUM(ReservationItem.quantity WHERE Reservation.status = ACTIVE)` en la sucursal.
2. Validar cada línea: `quantity solicitada <= disponible` para ese producto.
3. Crear `Reservation` + `ReservationItem`(s) con `status = ACTIVE` (opcional `customerId`, `createdByEmployeeId`, `expiresAt`).
4. **No** crear `InventoryMovement` ni modificar `Inventory`.
5. `AuditLog` con `branchId`.

**Convertir en venta (misma transacción):** crear `Sale` con `reservationId` + `SaleItem`(s) + `InventoryMovement(SALE)` + bajar `Inventory` + marcar `Reservation.status = COMPLETED`. Las ventas directas dejan `reservationId = null`. **Cancelar:** `status = CANCELLED`. Job periódico puede marcar `EXPIRED` cuando `expiresAt < hoy`.

---

### Devolución

1. Crear `Return` + `ReturnItem`(s) (vincular `saleId` si aplica).
2. **Incrementar** `Inventory` en la sucursal.
3. `InventoryMovement(RETURN)` con `returnId`.
4. Ajustar totales de la venta original o notas de crédito según política fiscal (puede requerir NCF de nota de crédito — fuera del schema actual).
5. `AuditLog`.

**Ejemplo:** 2 unidades defectuosas devueltas a stock de Santiago.

---

### Apertura de caja

1. Seleccionar `CashRegister` activo de la sucursal.
2. Verificar que el cajero (`Employee`) no tenga otro `CashShift` con estado **OPEN** (`closedAt == null`).
3. Crear `CashShift` con `openingAmount`, `openedAt = now()`.
4. Estado lógico **OPEN** (`closedAt` nulo).
5. `AuditLog`.

**Ejemplo:** Caja Principal, apertura RD$ 2,000, cajero Carlos.

---

### Cierre de caja

1. Obtener `CashShift` **OPEN** del cajero/caja.
2. Calcular **ingresos** (sumar `Payment` de ventas con `cashShiftId` del turno — efectivo/tarjeta según reporte).
3. Calcular **egresos** (retiros, devoluciones en efectivo — según módulo de caja).
4. Registrar `closingAmount` y `closedAt`.
5. Estado lógico **CLOSED**.
6. `AuditLog`.

**Fórmula orientativa:** `closingAmount` ≈ `openingAmount` + ingresos efectivo − egresos (validar arqueo físico).

---

## Reglas transversales para servicios

| Regla                | Detalle                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Inventario           | Siempre movimiento + actualización de `Inventory` en la misma TX                                                               |
| Disponibilidad       | Validar `disponible = Inventory.quantity - reservas ACTIVE` antes de venta, reserva o transferencia                              |
| Reservas             | No generan `InventoryMovement`; liberar con `COMPLETED`, `CANCELLED` o `EXPIRED`                                               |
| Stock negativo       | No permitir venta/transferencia/reserva si cantidad disponible insuficiente                                                    |
| NCF                  | Validar vigencia y cupo antes de incrementar                                                                                   |
| Ventas               | `COMPLETED` solo cuando inventario, pagos/crédito y NCF (si aplica) estén consistentes                                         |
| Anulación            | `Sale.status = CANCELLED` + reversar inventario con movimiento tipo `ADJUSTMENT` o `RETURN` — definir en servicio de anulación |
| CxC / CxP            | Actualizar `balance` y recalcular `status` en la misma TX del abono; job periódico para `OVERDUE`                              |
| Movimientos manuales | `performedByEmployeeId` obligatorio en `ADJUSTMENT`, `WASTE`, transferencias                                                   |
| Auditoría sucursal   | `AuditLog.branchId` en ventas, compras, caja, inventario, transferencias                                                       |
| Cliente              | Solo personas físicas; `firstName` y `lastName` obligatorios                                                                   |
| Descuentos           | Por línea: candidatos producto + categorías, filtrar exclusiones, `max()` de %; snapshot en `SaleItem`                         |
| Multi-tenant         | Filtrar siempre por `companyId` derivado de `UserCompany` / sucursal                                                           |
| Soft delete          | Solo master data (ver [Política de Soft Delete](#política-de-soft-delete)); transacciones usan status                          |
| Decimales            | Usar `Decimal` de Prisma; no `float` en JS para dinero                                                                         |

---

## Enums de referencia rápida

```
RoleName: OWNER | ADMIN | MANAGER | CASHIER | INVENTORY_ASSISTANT
SaleStatus: PENDING | COMPLETED | CANCELLED
PaymentMethod: CASH | CARD | TRANSFER | CREDIT
ReceivableStatus: OPEN | PARTIAL | PAID | OVERDUE
PayableStatus: OPEN | PARTIAL | PAID | OVERDUE
InventoryMovementType: PURCHASE | SALE | RETURN | TRANSFER_IN | TRANSFER_OUT | ADJUSTMENT | WASTE
ReservationStatus: ACTIVE | COMPLETED | CANCELLED | EXPIRED
NcfType: CONSUMIDOR_FINAL | CREDITO_FISCAL | GUBERNAMENTAL | REGIMEN_ESPECIAL | EXPORTACION
TransferStatus: PENDING | IN_TRANSIT | COMPLETED | CANCELLED
ReturnReason: DEFECTIVE | SALES_ERROR | EXPIRED | OTHER
```

---

## Estabilidad del dominio

No realizar más cambios estructurales al schema sin revisión arquitectónica. El diseño actual está alineado con las decisiones de negocio aprobadas.

**Opcional futuro:** `CashShiftStatus` (`OPEN` | `CLOSED`) — hoy se deriva de `closedAt`.

---

## Comandos útiles

```bash
# Desde la raíz del monorepo
pnpm --filter @repo/db db:migrate:dev
pnpm --filter @repo/db db:generate
```
