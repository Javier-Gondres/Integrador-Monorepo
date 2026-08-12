# Demo — Credenciales de prueba

Usuarios de ejemplo cargados por el seed (`packages/database/prisma/seed.ts`) para que externos puedan probar la app con distintos roles.

**Contraseña común (todos los usuarios):** `Password123`

**Empresa demo:** Empresa Demo (`empresa-demo`)

## Usuarios

| Email | Rol | Alcance | Qué puedes probar |
| --- | --- | --- | --- |
| `superadmin@ejemplo.com` | Super Admin | Plataforma (sin empresa) | Panel de plataforma: listar/suspender tenants. No opera el ERP de una empresa. |
| `prueba@ejemplo.com` | OWNER | Empresa demo · Sucursal Centro | Acceso completo al ERP de la empresa (configuración, usuarios, inventario, ventas, etc.). |
| `admin@ejemplo.com` | ADMIN | Empresa demo · Sucursal Centro | Administración amplia (usuarios, productos, caja, sucursales, reportes). No gestiona al OWNER ni entra a `/platform`. |
| `manager@ejemplo.com` | MANAGER | Empresa demo · Sucursal Centro | Operación diaria: ventas, clientes, inventario, caja, compras y reportes (sin gestión de usuarios). |
| `cajero@ejemplo.com` | CASHIER | Empresa demo · Sucursal Norte | Caja y ventas: abrir/cerrar caja, crear ventas, clientes. Sin crear productos ni gestionar usuarios. |
| `inventario@ejemplo.com` | INVENTORY_ASSISTANT | Empresa demo · Sucursal Centro | Inventario: consultar productos, ajustar stock y transferencias entre sucursales. |

## Cómo probar

1. Inicia sesión con el email del rol que quieras evaluar.
2. Usa la contraseña `Password123`.
3. Recorre el menú: cada rol solo verá (y podrá ejecutar) las acciones permitidas por su matriz de permisos.
