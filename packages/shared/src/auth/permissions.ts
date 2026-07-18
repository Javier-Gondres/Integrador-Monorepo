/**
 * Catálogo único de permisos RBAC del tenant.
 * Usar `Permission.*` en backend, frontend y seed — nunca strings sueltos.
 */
export const Permission = {
  USERS_CREATE: "users.create",
  USERS_READ: "users.read",
  USERS_UPDATE: "users.update",
  USERS_ACTIVATE: "users.activate",
  USERS_DEACTIVATE: "users.deactivate",
  USERS_DELETE: "users.delete",

  EMPLOYEES_CREATE: "employees.create",
  EMPLOYEES_READ: "employees.read",
  EMPLOYEES_UPDATE: "employees.update",
  EMPLOYEES_DELETE: "employees.delete",

  PRODUCTS_CREATE: "products.create",
  PRODUCTS_READ: "products.read",
  PRODUCTS_UPDATE: "products.update",
  PRODUCTS_DELETE: "products.delete",

  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_READ: "categories.read",
  CATEGORIES_UPDATE: "categories.update",
  CATEGORIES_DELETE: "categories.delete",

  DISCOUNTS_CREATE: "discounts.create",
  DISCOUNTS_READ: "discounts.read",
  DISCOUNTS_UPDATE: "discounts.update",
  DISCOUNTS_DELETE: "discounts.delete",

  CUSTOMERS_CREATE: "customers.create",
  CUSTOMERS_READ: "customers.read",
  CUSTOMERS_UPDATE: "customers.update",
  CUSTOMERS_DELETE: "customers.delete",

  SUPPLIERS_CREATE: "suppliers.create",
  SUPPLIERS_READ: "suppliers.read",
  SUPPLIERS_UPDATE: "suppliers.update",
  SUPPLIERS_DELETE: "suppliers.delete",

  INVENTORY_READ: "inventory.read",
  INVENTORY_ADJUST: "inventory.adjust",
  INVENTORY_TRANSFER: "inventory.transfer",

  SALES_CREATE: "sales.create",
  SALES_READ: "sales.read",
  SALES_CANCEL: "sales.cancel",
  SALES_BACKDATE: "sales.backdate",

  PURCHASES_CREATE: "purchases.create",
  PURCHASES_READ: "purchases.read",

  CASH_READ: "cash.read",
  CASH_OPEN: "cash.open",
  CASH_CLOSE: "cash.close",
  CASH_MANAGE: "cash.manage",

  BRANCHES_CREATE: "branches.create",
  BRANCHES_READ: "branches.read",
  BRANCHES_UPDATE: "branches.update",
  BRANCHES_DELETE: "branches.delete",

  REPORTS_READ: "reports.read",

  RESERVATIONS_CREATE: "reservations.create",
  RESERVATIONS_READ: "reservations.read",
  RESERVATIONS_CANCEL: "reservations.cancel",
} as const;

export type PermissionCode = (typeof Permission)[keyof typeof Permission];

export const ALL_PERMISSION_CODES = Object.values(
  Permission,
) as PermissionCode[];

export type PermissionDefinition = {
  code: PermissionCode;
  description: string;
};

/** Catálogo completo para seed y documentación. */
export const ALL_PERMISSIONS: readonly PermissionDefinition[] = [
  {
    code: Permission.USERS_CREATE,
    description: "Crear usuarios en la empresa",
  },
  { code: Permission.USERS_READ, description: "Ver usuarios de la empresa" },
  {
    code: Permission.USERS_UPDATE,
    description: "Actualizar usuarios de la empresa",
  },
  {
    code: Permission.USERS_ACTIVATE,
    description: "Activar usuarios de la empresa",
  },
  {
    code: Permission.USERS_DEACTIVATE,
    description: "Desactivar usuarios de la empresa",
  },
  {
    code: Permission.USERS_DELETE,
    description: "Eliminar usuarios de la empresa",
  },

  { code: Permission.EMPLOYEES_CREATE, description: "Registrar empleados" },
  { code: Permission.EMPLOYEES_READ, description: "Ver empleados" },
  { code: Permission.EMPLOYEES_UPDATE, description: "Actualizar empleados" },
  { code: Permission.EMPLOYEES_DELETE, description: "Eliminar empleados" },

  { code: Permission.PRODUCTS_CREATE, description: "Crear productos" },
  { code: Permission.PRODUCTS_READ, description: "Ver productos" },
  { code: Permission.PRODUCTS_UPDATE, description: "Actualizar productos" },
  { code: Permission.PRODUCTS_DELETE, description: "Eliminar productos" },

  { code: Permission.CATEGORIES_CREATE, description: "Crear categorías" },
  { code: Permission.CATEGORIES_READ, description: "Ver categorías" },
  { code: Permission.CATEGORIES_UPDATE, description: "Actualizar categorías" },
  { code: Permission.CATEGORIES_DELETE, description: "Eliminar categorías" },

  { code: Permission.DISCOUNTS_CREATE, description: "Crear descuentos" },
  { code: Permission.DISCOUNTS_READ, description: "Ver descuentos" },
  { code: Permission.DISCOUNTS_UPDATE, description: "Actualizar descuentos" },
  { code: Permission.DISCOUNTS_DELETE, description: "Eliminar descuentos" },

  { code: Permission.CUSTOMERS_CREATE, description: "Registrar clientes" },
  { code: Permission.CUSTOMERS_READ, description: "Ver clientes" },
  { code: Permission.CUSTOMERS_UPDATE, description: "Actualizar clientes" },
  { code: Permission.CUSTOMERS_DELETE, description: "Eliminar clientes" },

  { code: Permission.SUPPLIERS_CREATE, description: "Registrar proveedores" },
  { code: Permission.SUPPLIERS_READ, description: "Ver proveedores" },
  { code: Permission.SUPPLIERS_UPDATE, description: "Actualizar proveedores" },
  { code: Permission.SUPPLIERS_DELETE, description: "Eliminar proveedores" },

  { code: Permission.INVENTORY_READ, description: "Ver inventario" },
  { code: Permission.INVENTORY_ADJUST, description: "Ajustar inventario" },
  {
    code: Permission.INVENTORY_TRANSFER,
    description: "Transferir inventario entre sucursales",
  },

  { code: Permission.SALES_CREATE, description: "Registrar ventas" },
  { code: Permission.SALES_READ, description: "Ver ventas" },
  { code: Permission.SALES_CANCEL, description: "Cancelar ventas" },
  {
    code: Permission.SALES_BACKDATE,
    description: "Registrar ventas con fecha pasada",
  },

  { code: Permission.PURCHASES_CREATE, description: "Registrar compras" },
  { code: Permission.PURCHASES_READ, description: "Ver compras" },

  { code: Permission.CASH_READ, description: "Ver cajas y turnos" },
  { code: Permission.CASH_OPEN, description: "Abrir turno de caja" },
  { code: Permission.CASH_CLOSE, description: "Cerrar turno de caja" },
  { code: Permission.CASH_MANAGE, description: "Administrar cajas" },

  { code: Permission.BRANCHES_CREATE, description: "Crear sucursales" },
  { code: Permission.BRANCHES_READ, description: "Ver sucursales" },
  { code: Permission.BRANCHES_UPDATE, description: "Actualizar sucursales" },
  { code: Permission.BRANCHES_DELETE, description: "Eliminar sucursales" },

  { code: Permission.REPORTS_READ, description: "Ver reportes" },

  {
    code: Permission.RESERVATIONS_CREATE,
    description: "Crear reservaciones",
  },
  { code: Permission.RESERVATIONS_READ, description: "Ver reservaciones" },
  {
    code: Permission.RESERVATIONS_CANCEL,
    description: "Cancelar reservaciones",
  },
];
