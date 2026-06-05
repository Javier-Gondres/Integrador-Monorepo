# Modelo de dominio ERP multiempresa

Documentación de referencia para implementar servicios en `apps/api` y módulos en `apps/web`. El schema fuente está en [`prisma/schema.prisma`](../prisma/schema.prisma).

**Mercado objetivo:** República Dominicana (RNC, NCF DGII, RD$).

---

## Contexto para Cursor

- Cada **usuario** pertenece a **una sola empresa** (`UserCompany` con `@@unique([userId, deletedAt])`).
- Una **empresa** tiene muchas **sucursales**; el **inventario** es por sucursal (`Inventory`: único por `branchId + productId`).
- **Nunca** actualices `Inventory.quantity` sin crear un `InventoryMovement` en la misma transacción.
- Operaciones críticas (venta, compra, transferencia, devolución, abonos) deben ir en **`prisma.$transaction`**.
- Master data usa **soft delete** — ver [Política de Soft Delete](#política-de-soft-delete). No uses `delete()` en esos modelos.
- `AuditLog` es append-only: registrar eventos importantes, sin borrado físico. Incluir `branchId` cuando la acción ocurra en una sucursal.

### Ejemplos de negocio (datos ficticios)

| Concepto | Ejemplo |
|--------|---------|
| Empresa | Ferretería García SRL — RNC `131234567`, slug `ferreteria-garcia` |
| Sucursales | Santiago (Av. Estrella Sadhalá), Santo Domingo (Zona Oriental) |
| Producto | Coca-Cola 355 ml — código `BEB-001`, RD$ 45.00, proveedor Mercasid |
| Categorías | Bebidas, Refrescos (many-to-many con el producto) |
| Cliente consumidor final | Sin `customerId` en la venta, NCF tipo `CONSUMIDOR_FINAL` |
| Cliente crédito | Juan Pérez — cédula `00112345678`, venta RD$ 10,000 a 30 días |
| Proveedor | Induveca — órdenes de compra y `AccountPayable` si es a crédito |
| NCF | Secuencia `B02`, consecutivos `B0200000001`, `B0200000002`… |
| Caja | `Caja Principal` en sucursal Santiago — turno con apertura RD$ 2,000 |
| Descuento producto | "Verano 20%" vinculado directamente a Coca-Cola |
| Descuento categoría | "Bebidas 20%" en categoría Bebidas, excluyendo Coca-Cola 2L y Pepsi 2L |

---

## Política de Soft Delete

Mecanismo estándar: `deletedAt DateTime?`. Configuración en [`src/soft-delete/config.ts`](../src/soft-delete/config.ts). Guía de implementación en [`apps/api/docs/soft-delete.md`](../../../apps/api/docs/soft-delete.md).

**Regla general:** Master Data → soft delete. Histórico/transaccional → **nunca** soft delete.

**Regla arquitectónica:** Los catálogos pueden eliminarse lógicamente. Registros históricos y financieros nunca deben eliminarse (ni física ni lógicamente). Si una transacción deja de ser válida, cambiar de estado (`CANCELLED`, `REVERSED`, etc.) pero permanecer almacenada.

### Con soft delete (`deletedAt`)

| Modelo | Motivo |
|--------|--------|
| `Company` | Empresa desactivada; mantener historial |
| `Branch` | Sucursal cerrada |
| `User` | Usuario deja de trabajar |
| `Role` | Rol obsoleto |
| `UserCompany` | Membresía desactivada |
| `Employee` | Empleado desvinculado |
| `Category` | Categoría obsoleta |
| `Product` | Producto descontinuado |
| `Supplier` | Proveedor inactivo |
| `Customer` | Cliente inactivo |
| `Discount` | Promoción retirada |
| `CashRegister` | Caja fuera de servicio |

### Sin soft delete (histórico)

| Modelo | Alternativa |
|--------|-------------|
| `Inventory`, `InventoryMovement` | Fuente de verdad del stock |
| `Sale`, `SaleItem`, `Payment` | `SaleStatus` (`PENDING`, `COMPLETED`, `CANCELLED`) |
| `PurchaseOrder`, `PurchaseOrderItem` | `PurchaseOrderStatus` |
| `AccountReceivable`, `ReceivablePayment` | `ReceivableStatus` |
| `AccountPayable`, `PayablePayment` | `PayableStatus` |
| `CashShift` | `closedAt` / arqueo histórico |
| `Transfer`, `TransferItem` | `TransferStatus` |
| `Return`, `ReturnItem` | Registro permanente |
| `NcfSequence` | `isActive = false` si deja de usarse |
| `AuditLog` | Append-only |
| `RefreshToken` | `revoked` + `revokedAt` |

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

| Campo | Uso |
|-------|-----|
| `name`, `slug` | Identificación y rutas multi-tenant |
| `rnc` | Registro nacional del contribuyente |
| `email`, `phone` | Contacto |
| `isActive`, `deletedAt` | Soft delete |

**Relaciones:** `branches`, `products`, `customers`, `suppliers`, `ncfSequences`, `discounts`, `users` (vía `UserCompany`).

**Ejemplo:** Comercial Martínez SRL registra productos y secuencias NCF; las sucursales operan ventas e inventario local.

---

### `Branch`

Sucursal física: inventario, ventas, compras, cajas, transferencias.

| Campo | Uso |
|-------|-----|
| `companyId` | Pertenencia a la empresa |
| `name`, `address` | Identificación |
| `isActive`, `deletedAt` | Soft delete |

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

Vincula un usuario a **una** empresa y un rol. `defaultBranchId` opcional para UI por defecto.

**Regla:** Un usuario activo solo tiene una membresía (`@@unique([userId, deletedAt])`).

---

### `Employee`

Empleado operativo: siempre ligado a `User`, `Company` y `Branch`.

| Campo | Uso |
|-------|-----|
| `position` | Cargo |
| `salary`, `hireDate`, `terminationDate` | Datos laborales |
| `userId` | `@unique` — un empleado por usuario |

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

| Campo | Uso |
|-------|-----|
| `code` | Único por empresa (`@@unique([companyId, code, deletedAt])`) |
| `price` | Precio de referencia / lista |
| `supplierId` | Proveedor principal opcional |

El stock real vive en `Inventory` por sucursal.

---

### `Supplier`

Proveedor: compras y cuentas por pagar.

**Ejemplo:** Mercasid suministra abarrotes; `PurchaseOrder` y `AccountPayable` apuntan aquí.

---

### `Customer`

Cliente del sistema: **únicamente personas físicas**.

| Campo | Uso |
|-------|-----|
| `firstName`, `lastName` | Obligatorios |
| `cedula` | Opcional |
| `email`, `phone`, `address` | Contacto |

**Válidos:** Juan Pérez, María Rodríguez, Pedro Gómez.

**Inválidos:** Ferretería XYZ, Comercial García, Ministerio de Educación (no son personas).

Sin `customerId` en la venta = consumidor final en POS.

**Ejemplo:**

```json
{ "firstName": "Juan", "lastName": "Pérez", "cedula": "00112345678" }
```

---

### `Discount`

Promoción por **porcentaje** a nivel empresa. Modelo independiente:

```text
Discount ←→ Product          (productos incluidos directamente)
Discount ←→ Category         (categorías incluidas)
Discount ←→ DiscountExcludedProduct ←→ Product   (exclusiones)
```

| Campo / relación | Uso |
|------------------|-----|
| `percentage` | Porcentaje (ej. 20.00 = 20%) |
| `startDate`, `endDate` | Vigencia opcional |
| `products` | Productos con descuento directo |
| `categories` | Categorías completas con descuento |
| `excludedProducts` | Productos excluidos de **este** descuento |

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

### `Inventory`

Existencia: **un registro por** `(branchId, productId)`.

**Ejemplo:** Santiago 50, Santo Domingo 30 unidades de `BEB-001`.

---

### `InventoryMovement`

Historial inmutable de cambios de stock.

| `InventoryMovementType` | Origen típico |
|-------------------------|---------------|
| `PURCHASE` | Recepción de compra |
| `SALE` | Venta completada |
| `RETURN` | Devolución |
| `TRANSFER_OUT` / `TRANSFER_IN` | Transferencia entre sucursales |
| `ADJUSTMENT` | Ajuste manual autorizado |
| `WASTE` | Merma / vencimiento |

Campos opcionales de trazabilidad: `saleId`, `purchaseOrderId`, `returnId`, `transferId`, `performedByEmployeeId`.

| Responsable | Regla |
|-------------|-------|
| `ADJUSTMENT`, `WASTE`, `TRANSFER_OUT`, `TRANSFER_IN` | `performedByEmployeeId` **obligatorio** |
| `SALE`, `PURCHASE`, `RETURN` | Opcional; inferir desde `Sale.cashierId`, compra o `Return.employeeId` |

**Regla de oro:** Toda variación de `Inventory.quantity` debe tener su `InventoryMovement` correspondiente.

---

## Ventas y pagos

### `Sale`

Cabecera de venta en una sucursal.

| Campo | Uso |
|-------|-----|
| `status` | `PENDING` → `COMPLETED` o `CANCELLED` |
| `cashierId` | `Employee` que opera la venta |
| `cashShiftId` | Turno de caja abierto (opcional pero recomendado en POS) |
| `ncf`, `ncfSequenceId` | Comprobante fiscal generado |
| `subtotal`, `taxAmount`, `total` | Montos en RD$ |

---

### `SaleItem`

Línea: producto, cantidad, precio unitario, descuento aplicado y subtotal.

| Campo | Uso |
|-------|-----|
| `unitPrice` | Precio de lista al momento de la venta |
| `discountPercentage` | Snapshot del % aplicado (ej. 20.00) |
| `discountAmount` | Snapshot del monto descontado en RD$ (ej. 20.00) |
| `subtotal` | Total de línea **después** del descuento |

**Ejemplo:** Producto RD$ 100, descuento 20% → `discountPercentage = 20`, `discountAmount = 20`, `subtotal = 80`.

**Regla:** consultas e informes de ventas históricas usan estos campos; no recalculan `Discount` vigente hoy.

---

### `Payment`

Una venta puede tener **varios** pagos (efectivo + tarjeta). La venta mixta se modela con múltiples registros `Payment`, **no** con un método `MIXED`.

| `PaymentMethod` | Uso |
|-----------------|-----|
| `CASH`, `CARD`, `TRANSFER` | Contado |
| `CREDIT` | Dispara creación de `AccountReceivable` |

**Ejemplo venta mixta (Venta #1001):**

```text
Payment 1: CASH  — RD$ 500
Payment 2: CARD  — RD$ 1,000
Total venta: RD$ 1,500
```

Relación: `Sale` 1 ──── N `Payment`.

---

## Facturación fiscal

### `NcfSequence`

Secuencia autorizada DGII por empresa. **Sin soft delete** — preservar historial fiscal.

| Campo | Uso |
|-------|-----|
| `isActive` | Desactivar secuencia obsoleta o agotada |
| `currentNumber`, `maxNumber` | Control de consecutivos |

| `NcfType` | Uso típico |
|-----------|------------|
| `CONSUMIDOR_FINAL` | B02 — venta al público |
| `CREDITO_FISCAL` | B01 — casos fiscales específicos (no aplica a clientes empresa; clientes son personas) |
| `GUBERNAMENTAL`, `REGIMEN_ESPECIAL`, `EXPORTACION` | Según régimen |

Antes de completar venta fiscal:

1. Obtener secuencia activa (`isActive`, no vencida, `currentNumber < maxNumber`).
2. Incrementar `currentNumber` (en transacción).
3. Formar NCF: `prefix` + número con padding (ej. `B0200000001`).
4. Guardar en `Sale.ncf` y `Sale.ncfSequenceId`.

---

## Compras

### `PurchaseOrder`

Orden en sucursal con proveedor.

| `PurchaseOrderStatus` | Significado |
|-----------------------|-------------|
| `DRAFT` | Borrador editable |
| `APPROVED` | Aprobada, pendiente de recepción |
| `RECEIVED` | Mercancía recibida — aquí se mueve inventario |
| `CANCELLED` | Anulada |

---

### `PurchaseOrderItem`

Detalle: producto, cantidad, costo unitario, subtotal.

---

## Caja

### `CashRegister`

Caja física por sucursal (ej. "Caja 1", "Caja Principal").

---

### `CashShift`

Turno de un cajero en una caja.

| Campo | Uso |
|-------|-----|
| `openingAmount` | Fondo de caja al abrir |
| `closingAmount` | Contado al cerrar |
| `openedAt` / `closedAt` | Tiempos del turno |

**Estados derivados (lógica de servicio, no enum en schema hoy):**

| Estado | Condición |
|--------|-----------|
| `OPEN` | `closedAt == null` |
| `CLOSED` | `closedAt != null` y `closingAmount` registrado |

---

## Cuentas por cobrar / pagar

### `AccountReceivable`

Generada en venta a crédito (`Payment` con `CREDIT` o flujo sin pago contado según reglas de negocio).

| Campo | Uso |
|-------|-----|
| `originalAmount` | Deuda inicial (= total a crédito de la venta) |
| `balance` | Saldo pendiente |
| `dueDate` | Vencimiento |
| `status` | `ReceivableStatus` persistido |

| `ReceivableStatus` | Condición |
|--------------------|-----------|
| `OPEN` | Sin pagos registrados |
| `PARTIAL` | Tiene pagos y `balance > 0` |
| `PAID` | `balance == 0` |
| `OVERDUE` | `balance > 0` y `dueDate < hoy` |

Recalcular `status` después de cada `ReceivablePayment` (y en jobs de vencimiento para `OVERDUE`).

---

### `ReceivablePayment`

Abono que reduce `balance`. Validar que `amount <= balance`.

---

### `AccountPayable` / `PayablePayment`

Análogo con proveedores cuando la compra queda a crédito. `purchaseOrderId` es único por cuenta.

| `PayableStatus` | Condición |
|-----------------|-----------|
| `OPEN` | Sin pagos registrados |
| `PARTIAL` | Tiene pagos y `balance > 0` |
| `PAID` | `balance == 0` |
| `OVERDUE` | `balance > 0` y `dueDate < hoy` |

Recalcular `status` después de cada `PayablePayment`.

---

## Devoluciones y transferencias

### `Return` / `ReturnItem`

Devolución en sucursal; opcionalmente ligada a `Sale`.

| `ReturnReason` | Ejemplo |
|----------------|---------|
| `DEFECTIVE` | Producto dañado |
| `SALES_ERROR` | Cobro o producto equivocado |
| `EXPIRED` | Vencido |
| `OTHER` | Otro motivo (detalle en `notes`) |

---

### `Transfer` / `TransferItem`

Movimiento entre sucursales (`fromBranchId` → `toBranchId`).

| `TransferStatus` | Flujo |
|------------------|-------|
| `PENDING` | Creada |
| `IN_TRANSIT` | Enviada desde origen |
| `COMPLETED` | Recibida en destino |
| `CANCELLED` | Anulada |

---

## Auditoría

### `AuditLog`

Registro append-only: `action`, `entity`, `entityId`, `metadata` (JSON), `companyId`, `userId`, `branchId`.

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
2. Crear `ReceivablePayment` con `amount`.
3. Reducir `balance` (`balance = balance - amount`).
4. Recalcular `status`: `PAID` si `balance == 0`; `PARTIAL` si hay pagos y saldo pendiente; `OVERDUE` si vencida.
5. Rechazar abonos que excedan el saldo.
6. `AuditLog`.

**Ejemplo:** Abono RD$ 3,000 → balance pasa de 10,000 a 7,000.

---

### Compra (recepción de mercancía)

1. Crear `PurchaseOrder` (`DRAFT`) y `PurchaseOrderItem`(s).
2. Al aprobar/recibir: según política, pasar a `RECEIVED`.
3. Por ítem: **aumentar** `Inventory` en la sucursal de la orden (crear fila si no existe).
4. Crear `InventoryMovement(PURCHASE)` vinculado a `purchaseOrderId`.
5. Si es **a crédito**: crear `AccountPayable` con `originalAmount`, `balance`, `dueDate` y `status = OPEN`.
6. Si es contado: registrar pago al proveedor fuera de CxP o con `PayablePayment` inmediato (actualizar `status = PAID`).
7. `AuditLog` con `branchId`.

**Ejemplo:** Orden a Induveca por RD$ 50,000 — al recibir, stock sube y queda CxP si no se pagó al contado.

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

| Regla | Detalle |
|-------|---------|
| Inventario | Siempre movimiento + actualización de `Inventory` en la misma TX |
| Stock negativo | No permitir venta/transferencia si cantidad insuficiente |
| NCF | Validar vigencia y cupo antes de incrementar |
| Ventas | `COMPLETED` solo cuando inventario, pagos/crédito y NCF (si aplica) estén consistentes |
| Anulación | `Sale.status = CANCELLED` + reversar inventario con movimiento tipo `ADJUSTMENT` o `RETURN` — definir en servicio de anulación |
| CxC / CxP | Recalcular `status` tras cada abono; job periódico para marcar `OVERDUE` |
| Movimientos manuales | `performedByEmployeeId` obligatorio en `ADJUSTMENT`, `WASTE`, transferencias |
| Auditoría sucursal | `AuditLog.branchId` en ventas, compras, caja, inventario, transferencias |
| Cliente | Solo personas físicas; `firstName` y `lastName` obligatorios |
| Descuentos | Por línea: candidatos producto + categorías, filtrar exclusiones, `max()` de %; snapshot en `SaleItem` |
| Multi-tenant | Filtrar siempre por `companyId` derivado de `UserCompany` / sucursal |
| Soft delete | Solo master data (ver [Política de Soft Delete](#política-de-soft-delete)); transacciones usan status |
| Decimales | Usar `Decimal` de Prisma; no `float` en JS para dinero |

---

## Enums de referencia rápida

```
RoleName: OWNER | ADMIN | MANAGER | CASHIER | INVENTORY_ASSISTANT
SaleStatus: PENDING | COMPLETED | CANCELLED
PaymentMethod: CASH | CARD | TRANSFER | CREDIT
ReceivableStatus: OPEN | PARTIAL | PAID | OVERDUE
PayableStatus: OPEN | PARTIAL | PAID | OVERDUE
InventoryMovementType: PURCHASE | SALE | RETURN | TRANSFER_IN | TRANSFER_OUT | ADJUSTMENT | WASTE
NcfType: CONSUMIDOR_FINAL | CREDITO_FISCAL | GUBERNAMENTAL | REGIMEN_ESPECIAL | EXPORTACION
PurchaseOrderStatus: DRAFT | APPROVED | RECEIVED | CANCELLED
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
