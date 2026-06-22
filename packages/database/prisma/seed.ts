/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable no-console */
/**
 * Seed de desarrollo: datos de ejemplo para todos los modelos del schema.
 *
 * Uso:
 *   pnpm --filter @repo/db run db:seed:dev
 *
 * Credenciales (password: Password123):
 *   superadmin@ejemplo.com  — SUPER_ADMIN, sin tenant
 *   prueba@ejemplo.com      — OWNER
 *   admin@ejemplo.com       — ADMIN
 *   manager@ejemplo.com     — MANAGER
 *   cajero@ejemplo.com      — CASHIER
 *   inventario@ejemplo.com  — INVENTORY_ASSISTANT
 */
import bcrypt from "bcrypt";
import { ALL_PERMISSIONS, ROLE_PERMISSION_MATRIX } from "@repo/shared";

import { type ExtendedPrismaClient, prisma } from "../src/client.js";
import {
  InventoryAdjustmentReason,
  InventoryMovementType,
  NcfType,
  PayableStatus,
  PaymentMethod,
  ReceivableStatus,
  ReservationStatus,
  ReturnReason,
  RoleName,
  SaleStatus,
  TransferStatus,
} from "../src/generated/prisma/client.js";
import { runWithSoftDeleteQueryMode } from "../src/soft-delete/context.js";

const DEMO_COMPANY_SLUG = "empresa-demo";
const DEFAULT_SEED_PASSWORD = "Password123";
const ALL_ROLES = Object.values(RoleName);
const PASSWORD_HASH_ROUNDS = 10;

const SEED_IDS = {
  customerJuan: "seed-customer-juan-perez",
  customerMaria: "seed-customer-maria-rodriguez",
  customerPedro: "seed-customer-pedro-gomez",
  ncfB02: "seed-ncf-sequence-b02",
  discountSummer: "seed-discount-verano",
  discountBebidas: "seed-discount-bebidas",
  discountExclusion: "seed-discount-exclusion-cola-2l",
  cashRegisterCentro: "seed-cash-register-centro",
  cashRegisterNorte: "seed-cash-register-norte",
  cashShiftClosedCentro: "seed-cash-shift-closed-centro",
  cashShiftOpenNorte: "seed-cash-shift-open-norte",
  purchaseInitial: "seed-purchase-initial",
  purchaseCredit: "seed-purchase-credit",
  saleCash: "seed-sale-cash-completed",
  saleMixed: "seed-sale-mixed-completed",
  saleCredit: "seed-sale-credit-completed",
  salePending: "seed-sale-pending",
  saleCancelled: "seed-sale-cancelled",
  saleFromReservation: "seed-sale-from-reservation-lays",
  transferCompleted: "seed-transfer-completed",
  returnFromSale: "seed-return-from-sale",
  accountReceivable: "seed-account-receivable",
  receivablePayment: "seed-receivable-payment",
  accountPayable: "seed-account-payable",
  payablePayment: "seed-payable-payment",
  movementWaste: "seed-movement-waste-cola-2l",
  reservationActiveJuan: "seed-reservation-active-juan",
  reservationActiveJuanCola: "seed-reservation-active-juan-item-cola",
  reservationActiveJuanLays: "seed-reservation-active-juan-item-lays",
  reservationActiveJuanCombo: "seed-reservation-active-juan-item-combo",
  reservationCompleted: "seed-reservation-completed-lays",
  reservationCompletedItem: "seed-reservation-completed-item-lays",
  reservationCancelled: "seed-reservation-cancelled-leche",
  reservationCancelledItem: "seed-reservation-cancelled-item-leche",
  reservationExpired: "seed-reservation-expired-combo",
  reservationExpiredItem: "seed-reservation-expired-item-combo",
} as const;

type SeedUser = {
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  defaultBranchName?: string;
};

const SUPER_ADMIN_USER = {
  email: "superadmin@ejemplo.com",
  firstName: "Super",
  lastName: "Admin",
} as const;

const DEMO_USERS: SeedUser[] = [
  {
    email: "prueba@ejemplo.com",
    firstName: "Usuario",
    lastName: "Demo",
    role: RoleName.OWNER,
    defaultBranchName: "Sucursal Centro",
  },
  {
    email: "admin@ejemplo.com",
    firstName: "Laura",
    lastName: "Méndez",
    role: RoleName.ADMIN,
    defaultBranchName: "Sucursal Centro",
  },
  {
    email: "manager@ejemplo.com",
    firstName: "María",
    lastName: "García",
    role: RoleName.MANAGER,
    defaultBranchName: "Sucursal Centro",
  },
  {
    email: "cajero@ejemplo.com",
    firstName: "Carlos",
    lastName: "Ruiz",
    role: RoleName.CASHIER,
    defaultBranchName: "Sucursal Norte",
  },
  {
    email: "inventario@ejemplo.com",
    firstName: "Ana",
    lastName: "López",
    role: RoleName.INVENTORY_ASSISTANT,
    defaultBranchName: "Sucursal Centro",
  },
];

const DEMO_BRANCHES = [
  {
    name: "Sucursal Centro",
    address: "Av. Independencia #100, Santo Domingo",
  },
  {
    name: "Sucursal Norte",
    address: "Av. Monumental #45, Santiago",
  },
] as const;

const DEMO_SUPPLIERS = [
  {
    name: "Distribuidora Nacional SRL",
    contactName: "Pedro Martínez",
    email: "ventas@distnacional.com",
    phone: "809-555-0101",
    rnc: "101010101",
    address: "Zona industrial Herrera, Santo Domingo",
    notes: "Entrega martes y viernes",
  },
  {
    name: "Alimentos del Cibao SA",
    contactName: "Rosa Peña",
    email: "pedidos@alimentoscibao.com",
    phone: "809-555-0202",
    rnc: "202020202",
    address: "Carretera Duarte km 5, Santiago",
  },
  {
    name: "Bebidas Caribeña",
    contactName: "Luis Herrera",
    email: "logistica@bebidas-caribena.com",
    phone: "809-555-0303",
    rnc: "303030303",
  },
] as const;

const DEMO_CATEGORIES = [
  { name: "Bebidas", description: "Refrescos, jugos y agua" },
  { name: "Snacks", description: "Papas, galletas y dulces" },
  { name: "Lácteos", description: "Leche, queso y yogurt" },
] as const;

type DemoProductSupplier = {
  supplierName: string;
  isPreferred?: boolean;
  lastCost?: number;
};

type DemoProduct = {
  code: string;
  name: string;
  description: string;
  price: number;
  categoryNames: string[];
  suppliers: DemoProductSupplier[];
};

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    code: "BEB-COLA-355",
    name: "Coca-Cola 355 ml",
    description: "Refresco de cola lata",
    price: 45.0,
    categoryNames: ["Bebidas"],
    suppliers: [
      {
        supplierName: "Bebidas Caribeña",
        isPreferred: true,
        lastCost: 30,
      },
      {
        supplierName: "Distribuidora Nacional SRL",
        lastCost: 32,
      },
    ],
  },
  {
    code: "BEB-COLA-2L",
    name: "Coca-Cola 2 L",
    description: "Refresco de cola familiar",
    price: 120.0,
    categoryNames: ["Bebidas"],
    suppliers: [
      {
        supplierName: "Bebidas Caribeña",
        isPreferred: true,
        lastCost: 80,
      },
    ],
  },
  {
    code: "SNK-LAYS-40",
    name: "Papas Lay's clásicas 40 g",
    description: "Papas fritas individuales",
    price: 65.0,
    categoryNames: ["Snacks"],
    suppliers: [
      {
        supplierName: "Distribuidora Nacional SRL",
        isPreferred: true,
        lastCost: 45,
      },
      {
        supplierName: "Alimentos del Cibao SA",
        lastCost: 47,
      },
    ],
  },
  {
    code: "LAC-LECHE-1L",
    name: "Leche entera 1 L",
    description: "Leche UHT entera",
    price: 55.0,
    categoryNames: ["Lácteos"],
    suppliers: [
      {
        supplierName: "Alimentos del Cibao SA",
        isPreferred: true,
        lastCost: 40,
      },
    ],
  },
  {
    code: "COMBO-SNACK-BEB",
    name: "Combo snack + bebida",
    description: "Promoción: papas + refresco",
    price: 99.0,
    categoryNames: ["Snacks", "Bebidas"],
    suppliers: [
      {
        supplierName: "Distribuidora Nacional SRL",
        isPreferred: true,
        lastCost: 70,
      },
      {
        supplierName: "Bebidas Caribeña",
        lastCost: 72,
      },
    ],
  },
];

type DemoEmployee = {
  firstName: string;
  lastName: string;
  phone?: string;
  position: string;
  salary: number;
  branchName: string;
  linkUserEmail?: string;
  hireDate: Date;
};

const DEMO_EMPLOYEES: DemoEmployee[] = [
  {
    firstName: "María",
    lastName: "García",
    phone: "809-555-1001",
    position: "Gerente de tienda",
    salary: 45000,
    branchName: "Sucursal Centro",
    linkUserEmail: "manager@ejemplo.com",
    hireDate: new Date("2024-01-15"),
  },
  {
    firstName: "Carlos",
    lastName: "Ruiz",
    phone: "809-555-1002",
    position: "Cajero",
    salary: 25000,
    branchName: "Sucursal Norte",
    linkUserEmail: "cajero@ejemplo.com",
    hireDate: new Date("2024-06-01"),
  },
  {
    firstName: "Ana",
    lastName: "López",
    phone: "809-555-1003",
    position: "Asistente de inventario",
    salary: 22000,
    branchName: "Sucursal Centro",
    linkUserEmail: "inventario@ejemplo.com",
    hireDate: new Date("2025-02-10"),
  },
  {
    firstName: "José",
    lastName: "Ramírez",
    position: "Personal de limpieza",
    salary: 18000,
    branchName: "Sucursal Norte",
    hireDate: new Date("2025-08-20"),
  },
];

type ProductRef = { id: string; code: string; name: string; price: number };
type BranchRef = { id: string; name: string };
type EmployeeRef = { id: string; name: string; email: string };
type CustomerRef = { id: string; name: string };

type SeedContext = {
  companyId: string;
  branches: Map<string, BranchRef>;
  products: ProductRef[];
  productsByCode: Map<string, ProductRef>;
  employees: EmployeeRef[];
  ownerUserId: string;
};

type SeedInventoryClient = Pick<
  ExtendedPrismaClient,
  "inventory" | "inventoryMovement"
>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function demoEmployeeSeedEmail(employee: DemoEmployee): string {
  if (employee.linkUserEmail) {
    return normalizeEmail(employee.linkUserEmail);
  }
  const base = `${employee.firstName}.${employee.lastName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]/g, "");
  return `${base}@empleados.seed`;
}

function productByCode(ctx: SeedContext, code: string): ProductRef {
  const product = ctx.productsByCode.get(code);
  if (!product) {
    throw new Error(`Producto seed "${code}" no encontrado`);
  }
  return product;
}

function branchByName(ctx: SeedContext, name: string): BranchRef {
  const branch = ctx.branches.get(name);
  if (!branch) {
    throw new Error(`Sucursal seed "${name}" no encontrada`);
  }
  return branch;
}

function employeeByEmail(ctx: SeedContext, email: string): EmployeeRef {
  const employee = ctx.employees.find(
    (item) => normalizeEmail(item.email) === normalizeEmail(email),
  );
  if (!employee) {
    throw new Error(`Empleado seed "${email}" no encontrado`);
  }
  return employee;
}

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
}

async function recordMovementIfAbsent(
  tx: SeedInventoryClient,
  movement: {
    id: string;
    branchId: string;
    productId: string;
    type: InventoryMovementType;
    quantity: number;
    adjustmentReason?: InventoryAdjustmentReason;
    referenceNumber?: string;
    notes?: string;
    purchaseId?: string;
    saleId?: string;
    returnId?: string;
    transferId?: string;
    performedByEmployeeId?: string;
  },
  stockDelta: number,
): Promise<boolean> {
  const exists = await tx.inventoryMovement.findUnique({
    where: { id: movement.id },
    select: { id: true },
  });
  if (exists) {
    return false;
  }

  await tx.inventoryMovement.create({ data: movement });
  await tx.inventory.upsert({
    where: {
      branchId_productId: {
        branchId: movement.branchId,
        productId: movement.productId,
      },
    },
    create: {
      branchId: movement.branchId,
      productId: movement.productId,
      quantity: Math.max(0, stockDelta),
    },
    update: {
      quantity: { increment: stockDelta },
    },
  });

  return true;
}

async function ensureRoles(): Promise<void> {
  for (const name of ALL_ROLES) {
    const existing = await prisma.role.findFirst({ where: { name } });
    if (!existing) {
      await prisma.role.create({ data: { name } });
    }
  }
}

async function ensurePermissions(): Promise<void> {
  for (const perm of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      create: { code: perm.code, description: perm.description },
      update: { description: perm.description },
    });
  }
}

async function ensureRolePermissions(): Promise<void> {
  for (const roleName of Object.values(RoleName)) {
    const permCodes = ROLE_PERMISSION_MATRIX[roleName];
    const role = await prisma.role.findFirst({ where: { name: roleName } });
    if (!role) continue;

    for (const code of permCodes) {
      const permission = await prisma.permission.findUnique({
        where: { code },
      });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
        create: { roleId: role.id, permissionId: permission.id },
        update: {},
      });
    }
  }
}

async function ensureDemoCompany() {
  const existing = await prisma.company.findFirst({
    where: { slug: DEMO_COMPANY_SLUG },
  });

  const data = {
    name: "Empresa Demo",
    slug: DEMO_COMPANY_SLUG,
    rnc: "131415161",
    email: "contacto@empresa-demo.com",
    phone: "809-555-0000",
  };

  if (existing) {
    return prisma.company.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.company.create({ data });
}

async function ensureDemoBranches(companyId: string) {
  const byName = new Map<string, BranchRef>();

  for (const branch of DEMO_BRANCHES) {
    const existing = await prisma.branch.findFirst({
      where: { companyId, name: branch.name, deletedAt: null },
      select: { id: true, name: true },
    });

    if (existing) {
      await prisma.branch.update({
        where: { id: existing.id },
        data: { address: branch.address },
      });
      byName.set(branch.name, existing);
      continue;
    }

    const created = await prisma.branch.create({
      data: { companyId, ...branch },
      select: { id: true, name: true },
    });
    byName.set(branch.name, created);
  }

  return byName;
}

async function ensureUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
) {
  const normalized = normalizeEmail(email);
  const existing = await prisma.user.findFirst({
    where: { email: normalized, deletedAt: null },
    select: { id: true, email: true },
  });

  if (existing) {
    return existing;
  }

  const passwordHash = await hashPassword(password);
  return prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      firstName,
      lastName,
      lastLoginAt: new Date(),
    },
    select: { id: true, email: true },
  });
}

/** Operador de plataforma: sin membresía tenant (UserCompany). */
async function ensureSuperAdminUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
) {
  const normalized = normalizeEmail(email);
  const existing = await prisma.user.findFirst({
    where: { email: normalized, deletedAt: null },
    select: { id: true, email: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { isSuperAdmin: true, firstName, lastName },
    });
    return existing;
  }

  const passwordHash = await hashPassword(password);
  return prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      firstName,
      lastName,
      isSuperAdmin: true,
      lastLoginAt: new Date(),
    },
    select: { id: true, email: true },
  });
}

async function linkUserToCompany(
  email: string,
  companyId: string,
  roleName: RoleName,
  defaultBranchId?: string,
): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { email: normalizeEmail(email) },
    select: { id: true },
  });

  if (!user) {
    throw new Error(`Usuario "${email}" no encontrado.`);
  }

  const role = await prisma.role.findFirstOrThrow({
    where: { name: roleName },
    select: { id: true },
  });

  const membership = await prisma.userCompany.findFirst({
    where: { userId: user.id, deletedAt: null },
    select: { id: true },
  });

  if (membership) {
    await prisma.userCompany.update({
      where: { id: membership.id },
      data: { companyId, roleId: role.id, defaultBranchId },
    });
    return;
  }

  await prisma.userCompany.create({
    data: {
      userId: user.id,
      companyId,
      roleId: role.id,
      defaultBranchId,
    },
  });
}

async function ensureDemoSuppliers(companyId: string) {
  const byName = new Map<string, { id: string; name: string }>();

  for (const supplier of DEMO_SUPPLIERS) {
    const existing = await prisma.supplier.findFirst({
      where: { companyId, name: supplier.name, deletedAt: null },
      select: { id: true, name: true },
    });

    if (existing) {
      await prisma.supplier.update({
        where: { id: existing.id },
        data: supplier,
      });
      byName.set(supplier.name, existing);
      continue;
    }

    const created = await prisma.supplier.create({
      data: { companyId, ...supplier },
      select: { id: true, name: true },
    });
    byName.set(supplier.name, created);
  }

  return byName;
}

async function ensureDemoCategories(companyId: string) {
  const byName = new Map<string, { id: string; name: string }>();

  for (const { name, description } of DEMO_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { companyId, name, deletedAt: null },
      select: { id: true, name: true },
    });

    if (existing) {
      byName.set(name, existing);
      continue;
    }

    const created = await prisma.category.create({
      data: { companyId, name, description },
      select: { id: true, name: true },
    });
    byName.set(name, created);
  }

  return byName;
}

async function ensureProductSuppliers(
  productId: string,
  suppliers: DemoProductSupplier[],
  suppliersByName: Map<string, { id: string; name: string }>,
): Promise<void> {
  for (const link of suppliers) {
    const supplier = suppliersByName.get(link.supplierName);
    if (!supplier) {
      throw new Error(`Proveedor seed "${link.supplierName}" no encontrado`);
    }

    const isPreferred = link.isPreferred ?? false;

    await prisma.$transaction(async (tx) => {
      if (isPreferred) {
        await tx.productSupplier.updateMany({
          where: {
            productId,
            isPreferred: true,
            supplierId: { not: supplier.id },
          },
          data: { isPreferred: false },
        });
      }

      await tx.productSupplier.upsert({
        where: {
          productId_supplierId: {
            productId,
            supplierId: supplier.id,
          },
        },
        create: {
          productId,
          supplierId: supplier.id,
          isPreferred,
          lastCost: link.lastCost,
        },
        update: {
          isPreferred,
          lastCost: link.lastCost,
        },
      });
    });
  }
}

async function ensureDemoProducts(
  companyId: string,
  categoriesByName: Map<string, { id: string; name: string }>,
  suppliersByName: Map<string, { id: string; name: string }>,
): Promise<ProductRef[]> {
  const created: ProductRef[] = [];

  for (const item of DEMO_PRODUCTS) {
    const categoryIds = item.categoryNames.map((name) => {
      const category = categoriesByName.get(name);
      if (!category) {
        throw new Error(`Categoría seed "${name}" no encontrada`);
      }
      return category.id;
    });

    const existing = await prisma.product.findFirst({
      where: { companyId, code: item.code, deletedAt: null },
      select: { id: true, code: true, name: true, price: true },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          categories: { set: categoryIds.map((id) => ({ id })) },
        },
      });
      await ensureProductSuppliers(
        existing.id,
        item.suppliers,
        suppliersByName,
      );
      created.push({
        id: existing.id,
        code: existing.code,
        name: item.name,
        price: item.price,
      });
      continue;
    }

    const product = await prisma.product.create({
      data: {
        companyId,
        code: item.code,
        name: item.name,
        description: item.description,
        price: item.price,
        categories: {
          connect: categoryIds.map((id) => ({ id })),
        },
      },
      select: { id: true, code: true, name: true, price: true },
    });
    await ensureProductSuppliers(product.id, item.suppliers, suppliersByName);
    created.push({
      id: product.id,
      code: product.code,
      name: product.name,
      price: Number(product.price),
    });
  }

  return created;
}

async function ensureDemoEmployees(
  companyId: string,
  branchesByName: Map<string, BranchRef>,
  password: string,
): Promise<EmployeeRef[]> {
  const created: EmployeeRef[] = [];

  for (const employee of DEMO_EMPLOYEES) {
    const branch = branchesByName.get(employee.branchName);
    if (!branch) {
      throw new Error(`Sucursal seed "${employee.branchName}" no encontrada`);
    }

    const email = demoEmployeeSeedEmail(employee);
    const user = await ensureUser(
      email,
      password,
      employee.firstName,
      employee.lastName,
    );

    if (!employee.linkUserEmail) {
      await linkUserToCompany(
        email,
        companyId,
        RoleName.INVENTORY_ASSISTANT,
        branch.id,
      );
    }

    const data = {
      companyId,
      branchId: branch.id,
      userId: user.id,
      phone: employee.phone ?? null,
      position: employee.position,
      salary: employee.salary,
      hireDate: employee.hireDate,
      isActive: true,
      deletedAt: null,
    };

    const record = await runWithSoftDeleteQueryMode(
      "includeDeleted",
      async () => {
        const existing = await prisma.employee.findUnique({
          where: { userId: user.id },
          select: { id: true },
        });

        if (existing) {
          return prisma.employee.update({
            where: { id: existing.id },
            data,
            select: { id: true },
          });
        }

        return prisma.employee.create({
          data,
          select: { id: true },
        });
      },
    );

    created.push({
      id: record.id,
      name: `${employee.firstName} ${employee.lastName}`,
      email,
    });
  }

  return created;
}

async function ensureDemoCustomers(companyId: string): Promise<CustomerRef[]> {
  const customers = [
    {
      id: SEED_IDS.customerJuan,
      firstName: "Juan",
      lastName: "Pérez",
      cedula: "00112345678",
      email: "juan.perez@ejemplo.com",
      phone: "809-555-2001",
      address: "Calle El Sol #12, Santo Domingo",
    },
    {
      id: SEED_IDS.customerMaria,
      firstName: "María",
      lastName: "Rodríguez",
      cedula: "40222334455",
      email: "maria.rodriguez@ejemplo.com",
      phone: "809-555-2002",
      address: "Los Jardines, Santiago",
    },
    {
      id: SEED_IDS.customerPedro,
      firstName: "Pedro",
      lastName: "Gómez",
      cedula: "03198765432",
      email: "pedro.gomez@ejemplo.com",
      phone: "809-555-2003",
    },
  ] as const;

  const created: CustomerRef[] = [];

  for (const customer of customers) {
    const record = await prisma.customer.upsert({
      where: { id: customer.id },
      create: { companyId, ...customer },
      update: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        cedula: customer.cedula,
        email: customer.email,
        phone: customer.phone,
        address: "address" in customer ? customer.address : undefined,
      },
      select: { id: true, firstName: true, lastName: true },
    });
    created.push({
      id: record.id,
      name: `${record.firstName} ${record.lastName}`,
    });
  }

  return created;
}

async function ensureDemoNcfSequence(companyId: string) {
  return prisma.ncfSequence.upsert({
    where: { id: SEED_IDS.ncfB02 },
    create: {
      id: SEED_IDS.ncfB02,
      companyId,
      type: NcfType.CONSUMIDOR_FINAL,
      prefix: "B02",
      currentNumber: 4,
      maxNumber: 9_999_999,
      expirationDate: daysFromNow(365),
      isActive: true,
    },
    update: {
      expirationDate: daysFromNow(365),
      isActive: true,
    },
  });
}

async function ensureDemoDiscounts(
  companyId: string,
  categoriesByName: Map<string, { id: string; name: string }>,
  productsByCode: Map<string, ProductRef>,
) {
  const cola355 = productsByCode.get("BEB-COLA-355");
  const cola2l = productsByCode.get("BEB-COLA-2L");
  const bebidas = categoriesByName.get("Bebidas");

  if (!cola355 || !cola2l || !bebidas) {
    throw new Error("Faltan productos o categorías para los descuentos seed.");
  }

  const summer = await prisma.discount.upsert({
    where: { id: SEED_IDS.discountSummer },
    create: {
      id: SEED_IDS.discountSummer,
      companyId,
      name: "Verano 20%",
      description: "Descuento directo en Coca-Cola 355 ml",
      percentage: 20,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2026-12-31"),
      products: { connect: [{ id: cola355.id }] },
    },
    update: {
      name: "Verano 20%",
      percentage: 20,
      products: { set: [{ id: cola355.id }] },
      categories: { set: [] },
      excludedProducts: { deleteMany: {} },
    },
  });

  const bebidasDiscount = await prisma.discount.upsert({
    where: { id: SEED_IDS.discountBebidas },
    create: {
      id: SEED_IDS.discountBebidas,
      companyId,
      name: "Bebidas 15%",
      description: "Descuento en toda la categoría Bebidas",
      percentage: 15,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2026-12-31"),
      categories: { connect: [{ id: bebidas.id }] },
    },
    update: {
      name: "Bebidas 15%",
      percentage: 15,
      categories: { set: [{ id: bebidas.id }] },
      products: { set: [] },
    },
  });

  await prisma.discountExcludedProduct.upsert({
    where: { id: SEED_IDS.discountExclusion },
    create: {
      id: SEED_IDS.discountExclusion,
      discountId: bebidasDiscount.id,
      productId: cola2l.id,
    },
    update: {
      discountId: bebidasDiscount.id,
      productId: cola2l.id,
    },
  });

  return { summer, bebidas: bebidasDiscount };
}

async function ensureDemoCashRegisters(ctx: SeedContext) {
  const centro = branchByName(ctx, "Sucursal Centro");
  const norte = branchByName(ctx, "Sucursal Norte");

  const registers = [
    {
      id: SEED_IDS.cashRegisterCentro,
      branchId: centro.id,
      name: "Caja Principal",
    },
    { id: SEED_IDS.cashRegisterNorte, branchId: norte.id, name: "Caja 1" },
  ] as const;

  const created: Awaited<ReturnType<typeof prisma.cashRegister.upsert>>[] = [];
  for (const register of registers) {
    const record = await prisma.cashRegister.upsert({
      where: { id: register.id },
      create: register,
      update: { name: register.name, branchId: register.branchId },
    });
    created.push(record);
  }

  return created;
}

async function ensureDemoCashShifts(ctx: SeedContext) {
  const centro = branchByName(ctx, "Sucursal Centro");
  const norte = branchByName(ctx, "Sucursal Norte");
  const cashierCentro = employeeByEmail(ctx, "manager@ejemplo.com");
  const cashierNorte = employeeByEmail(ctx, "cajero@ejemplo.com");

  const closedShift = await prisma.cashShift.upsert({
    where: { id: SEED_IDS.cashShiftClosedCentro },
    create: {
      id: SEED_IDS.cashShiftClosedCentro,
      cashRegisterId: SEED_IDS.cashRegisterCentro,
      cashierId: cashierCentro.id,
      openingAmount: 2000,
      closingAmount: 4850,
      openedAt: daysAgo(2),
      closedAt: daysAgo(2),
    },
    update: {
      openingAmount: 2000,
      closingAmount: 4850,
      closedAt: daysAgo(2),
    },
  });

  const openShift = await prisma.cashShift.upsert({
    where: { id: SEED_IDS.cashShiftOpenNorte },
    create: {
      id: SEED_IDS.cashShiftOpenNorte,
      cashRegisterId: SEED_IDS.cashRegisterNorte,
      cashierId: cashierNorte.id,
      openingAmount: 1500,
      openedAt: daysAgo(0),
      closedAt: null,
    },
    update: {
      openingAmount: 1500,
      closedAt: null,
      closingAmount: null,
    },
  });

  return { closedShift, openShift, centro, norte };
}

async function ensureDemoPurchases(
  ctx: SeedContext,
  suppliersByName: Map<string, { id: string; name: string }>,
) {
  const centro = branchByName(ctx, "Sucursal Centro");
  const distribuidora = suppliersByName.get("Distribuidora Nacional SRL");
  const bebidas = suppliersByName.get("Bebidas Caribeña");

  if (!distribuidora || !bebidas) {
    throw new Error("Proveedores seed no encontrados.");
  }

  const cola355 = productByCode(ctx, "BEB-COLA-355");
  const cola2l = productByCode(ctx, "BEB-COLA-2L");
  const lays = productByCode(ctx, "SNK-LAYS-40");
  const leche = productByCode(ctx, "LAC-LECHE-1L");
  const combo = productByCode(ctx, "COMBO-SNACK-BEB");
  const receivedBy = employeeByEmail(ctx, "inventario@ejemplo.com");

  const initialItems = [
    {
      id: "seed-purchase-initial-item-cola",
      productId: cola355.id,
      quantity: 200,
      unitCost: 30,
      subtotal: 6000,
    },
    {
      id: "seed-purchase-initial-item-cola-2l",
      productId: cola2l.id,
      quantity: 60,
      unitCost: 80,
      subtotal: 4800,
    },
    {
      id: "seed-purchase-initial-item-lays",
      productId: lays.id,
      quantity: 150,
      unitCost: 45,
      subtotal: 6750,
    },
    {
      id: "seed-purchase-initial-item-leche",
      productId: leche.id,
      quantity: 100,
      unitCost: 40,
      subtotal: 4000,
    },
    {
      id: "seed-purchase-initial-item-combo",
      productId: combo.id,
      quantity: 80,
      unitCost: 70,
      subtotal: 5600,
    },
  ] as const;

  const initialTotal = initialItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );

  await prisma.purchase.upsert({
    where: { id: SEED_IDS.purchaseInitial },
    create: {
      id: SEED_IDS.purchaseInitial,
      branchId: centro.id,
      supplierId: bebidas.id,
      invoiceNumber: "FAC-BC-2026-001",
      invoiceDate: daysAgo(14),
      receivedByEmployeeId: receivedBy.id,
      subtotal: initialTotal,
      taxAmount: 0,
      total: initialTotal,
      items: { create: [...initialItems] },
    },
    update: {
      invoiceNumber: "FAC-BC-2026-001",
      invoiceDate: daysAgo(14),
      receivedByEmployeeId: receivedBy.id,
      subtotal: initialTotal,
      total: initialTotal,
    },
  });

  await prisma.$transaction(async (tx) => {
    for (const item of initialItems) {
      await recordMovementIfAbsent(
        tx,
        {
          id: item.id.replace("item", "movement"),
          branchId: centro.id,
          productId: item.productId,
          type: InventoryMovementType.PURCHASE,
          quantity: item.quantity,
          notes: "Compra registrada seed-purchase-initial",
          purchaseId: SEED_IDS.purchaseInitial,
        },
        item.quantity,
      );
    }
  });

  const creditItems = [
    {
      id: "seed-purchase-credit-item-combo",
      productId: combo.id,
      quantity: 40,
      unitCost: 70,
      subtotal: 2800,
    },
  ] as const;

  await prisma.purchase.upsert({
    where: { id: SEED_IDS.purchaseCredit },
    create: {
      id: SEED_IDS.purchaseCredit,
      branchId: centro.id,
      supplierId: distribuidora.id,
      invoiceNumber: "FAC-DN-2026-042",
      invoiceDate: daysAgo(7),
      receivedByEmployeeId: receivedBy.id,
      subtotal: 2800,
      taxAmount: 0,
      total: 2800,
      items: { create: [...creditItems] },
    },
    update: {
      invoiceNumber: "FAC-DN-2026-042",
      invoiceDate: daysAgo(7),
      receivedByEmployeeId: receivedBy.id,
      subtotal: 2800,
      total: 2800,
    },
  });

  await prisma.$transaction(async (tx) => {
    for (const item of creditItems) {
      await recordMovementIfAbsent(
        tx,
        {
          id: "seed-movement-purchase-credit-combo",
          branchId: centro.id,
          productId: item.productId,
          type: InventoryMovementType.PURCHASE,
          quantity: item.quantity,
          notes: "Compra registrada seed-purchase-credit",
          purchaseId: SEED_IDS.purchaseCredit,
        },
        item.quantity,
      );
    }
  });

  await prisma.accountPayable.upsert({
    where: { id: SEED_IDS.accountPayable },
    create: {
      id: SEED_IDS.accountPayable,
      supplierId: distribuidora.id,
      purchaseId: SEED_IDS.purchaseCredit,
      originalAmount: 2800,
      balance: 1800,
      dueDate: daysFromNow(30),
      status: PayableStatus.PARTIAL,
    },
    update: {
      originalAmount: 2800,
      balance: 1800,
      status: PayableStatus.PARTIAL,
    },
  });

  await prisma.payablePayment.upsert({
    where: { id: SEED_IDS.payablePayment },
    create: {
      id: SEED_IDS.payablePayment,
      accountPayableId: SEED_IDS.accountPayable,
      amount: 1000,
      method: PaymentMethod.TRANSFER,
      notes: "Abono inicial a proveedor",
    },
    update: {
      amount: 1000,
      method: PaymentMethod.TRANSFER,
    },
  });

  const inventoryAssistant = employeeByEmail(ctx, "inventario@ejemplo.com");

  await prisma.$transaction(async (tx) => {
    await recordMovementIfAbsent(
      tx,
      {
        id: SEED_IDS.movementWaste,
        branchId: centro.id,
        productId: cola2l.id,
        type: InventoryMovementType.WASTE,
        quantity: 2,
        adjustmentReason: InventoryAdjustmentReason.DAMAGE,
        referenceNumber: "ACTA-MERMA-001",
        notes: "Merma por producto dañado",
        performedByEmployeeId: inventoryAssistant.id,
      },
      -2,
    );
  });
}

async function upsertReservationItem(
  id: string,
  reservationId: string,
  productId: string,
  quantity: number,
) {
  await prisma.reservationItem.upsert({
    where: { id },
    create: { id, reservationId, productId, quantity },
    update: { quantity },
  });
}

async function ensureDemoReservations(
  ctx: SeedContext,
  customers: CustomerRef[],
) {
  const norte = branchByName(ctx, "Sucursal Norte");
  const cola355 = productByCode(ctx, "BEB-COLA-355");
  const lays = productByCode(ctx, "SNK-LAYS-40");
  const leche = productByCode(ctx, "LAC-LECHE-1L");
  const combo = productByCode(ctx, "COMBO-SNACK-BEB");

  const juan = customers.find((c) => c.id === SEED_IDS.customerJuan);
  const maria = customers.find((c) => c.id === SEED_IDS.customerMaria);
  if (!juan || !maria) {
    throw new Error("Clientes seed no encontrados para reservas.");
  }

  const cashier = employeeByEmail(ctx, "cajero@ejemplo.com");

  await prisma.reservation.upsert({
    where: { id: SEED_IDS.reservationActiveJuan },
    create: {
      id: SEED_IDS.reservationActiveJuan,
      companyId: ctx.companyId,
      branchId: norte.id,
      customerId: juan.id,
      createdByEmployeeId: cashier.id,
      expiresAt: daysFromNow(7),
      notes:
        "Cliente retira el lunes — 10 Coca-Cola 355ml, 5 Lays, 3 combos snack+beb",
      status: ReservationStatus.ACTIVE,
    },
    update: {
      expiresAt: daysFromNow(7),
      status: ReservationStatus.ACTIVE,
      notes:
        "Cliente retira el lunes — 10 Coca-Cola 355ml, 5 Lays, 3 combos snack+beb",
    },
  });

  await upsertReservationItem(
    SEED_IDS.reservationActiveJuanCola,
    SEED_IDS.reservationActiveJuan,
    cola355.id,
    10,
  );
  await upsertReservationItem(
    SEED_IDS.reservationActiveJuanLays,
    SEED_IDS.reservationActiveJuan,
    lays.id,
    5,
  );
  await upsertReservationItem(
    SEED_IDS.reservationActiveJuanCombo,
    SEED_IDS.reservationActiveJuan,
    combo.id,
    3,
  );

  await prisma.reservation.upsert({
    where: { id: SEED_IDS.reservationCompleted },
    create: {
      id: SEED_IDS.reservationCompleted,
      companyId: ctx.companyId,
      branchId: norte.id,
      customerId: maria.id,
      createdByEmployeeId: cashier.id,
      notes: "Convertida en venta en efectivo",
      status: ReservationStatus.COMPLETED,
    },
    update: { status: ReservationStatus.COMPLETED },
  });
  await upsertReservationItem(
    SEED_IDS.reservationCompletedItem,
    SEED_IDS.reservationCompleted,
    lays.id,
    5,
  );

  await prisma.reservation.upsert({
    where: { id: SEED_IDS.reservationCancelled },
    create: {
      id: SEED_IDS.reservationCancelled,
      companyId: ctx.companyId,
      branchId: norte.id,
      customerId: juan.id,
      createdByEmployeeId: cashier.id,
      notes: "Cliente no retiró — reserva cancelada",
      status: ReservationStatus.CANCELLED,
    },
    update: { status: ReservationStatus.CANCELLED },
  });
  await upsertReservationItem(
    SEED_IDS.reservationCancelledItem,
    SEED_IDS.reservationCancelled,
    leche.id,
    3,
  );

  await prisma.reservation.upsert({
    where: { id: SEED_IDS.reservationExpired },
    create: {
      id: SEED_IDS.reservationExpired,
      companyId: ctx.companyId,
      branchId: norte.id,
      expiresAt: daysAgo(3),
      notes: "Venció sin retiro",
      status: ReservationStatus.EXPIRED,
    },
    update: { status: ReservationStatus.EXPIRED },
  });
  await upsertReservationItem(
    SEED_IDS.reservationExpiredItem,
    SEED_IDS.reservationExpired,
    combo.id,
    2,
  );
}

async function ensureDemoSalesAndFinance(
  ctx: SeedContext,
  customers: CustomerRef[],
) {
  const norte = branchByName(ctx, "Sucursal Norte");
  const cashier = employeeByEmail(ctx, "cajero@ejemplo.com");
  const openShiftId = SEED_IDS.cashShiftOpenNorte;
  const ncfSequenceId = SEED_IDS.ncfB02;

  const cola355 = productByCode(ctx, "BEB-COLA-355");
  const lays = productByCode(ctx, "SNK-LAYS-40");
  const leche = productByCode(ctx, "LAC-LECHE-1L");
  const combo = productByCode(ctx, "COMBO-SNACK-BEB");

  const juan = customers.find((c) => c.id === SEED_IDS.customerJuan);
  if (!juan) {
    throw new Error("Cliente Juan no encontrado.");
  }

  const cashColaQty = 3;
  const cashColaUnit = cola355.price;
  const cashColaDiscountPct = 20;
  const cashColaDiscountAmt =
    (cashColaUnit * cashColaQty * cashColaDiscountPct) / 100;
  const cashColaSubtotal = cashColaUnit * cashColaQty - cashColaDiscountAmt;
  const cashLaysSubtotal = lays.price;
  const cashSaleSubtotal = cashColaSubtotal + cashLaysSubtotal;
  const cashSaleTotal = cashSaleSubtotal;

  await prisma.sale.upsert({
    where: { id: SEED_IDS.saleCash },
    create: {
      id: SEED_IDS.saleCash,
      branchId: norte.id,
      cashierId: cashier.id,
      cashShiftId: openShiftId,
      ncfSequenceId,
      ncf: "B0200000001",
      ncfType: NcfType.CONSUMIDOR_FINAL,
      subtotal: cashSaleSubtotal,
      taxAmount: 0,
      total: cashSaleTotal,
      status: SaleStatus.COMPLETED,
      items: {
        create: [
          {
            id: "seed-sale-cash-item-cola",
            productId: cola355.id,
            quantity: cashColaQty,
            unitPrice: cashColaUnit,
            discountPercentage: cashColaDiscountPct,
            discountAmount: cashColaDiscountAmt,
            subtotal: cashColaSubtotal,
          },
          {
            id: "seed-sale-cash-item-lays",
            productId: lays.id,
            quantity: 1,
            unitPrice: lays.price,
            discountPercentage: 0,
            discountAmount: 0,
            subtotal: cashLaysSubtotal,
          },
        ],
      },
      payments: {
        create: [
          {
            id: "seed-sale-cash-payment",
            method: PaymentMethod.CASH,
            amount: cashSaleTotal,
          },
        ],
      },
    },
    update: {
      status: SaleStatus.COMPLETED,
      subtotal: cashSaleSubtotal,
      total: cashSaleTotal,
    },
  });

  await prisma.$transaction(async (tx) => {
    await recordMovementIfAbsent(
      tx,
      {
        id: "seed-movement-sale-cash-cola",
        branchId: norte.id,
        productId: cola355.id,
        type: InventoryMovementType.SALE,
        quantity: cashColaQty,
        saleId: SEED_IDS.saleCash,
        performedByEmployeeId: cashier.id,
      },
      -cashColaQty,
    );
    await recordMovementIfAbsent(
      tx,
      {
        id: "seed-movement-sale-cash-lays",
        branchId: norte.id,
        productId: lays.id,
        type: InventoryMovementType.SALE,
        quantity: 1,
        saleId: SEED_IDS.saleCash,
        performedByEmployeeId: cashier.id,
      },
      -1,
    );
  });

  const mixedQty = 2;
  const mixedSubtotal = leche.price * mixedQty;
  const mixedCash = 60;
  const mixedCard = mixedSubtotal - mixedCash;

  await prisma.sale.upsert({
    where: { id: SEED_IDS.saleMixed },
    create: {
      id: SEED_IDS.saleMixed,
      branchId: norte.id,
      cashierId: cashier.id,
      cashShiftId: openShiftId,
      ncfSequenceId,
      ncf: "B0200000002",
      ncfType: NcfType.CONSUMIDOR_FINAL,
      subtotal: mixedSubtotal,
      taxAmount: 0,
      total: mixedSubtotal,
      status: SaleStatus.COMPLETED,
      items: {
        create: [
          {
            id: "seed-sale-mixed-item-leche",
            productId: leche.id,
            quantity: mixedQty,
            unitPrice: leche.price,
            discountPercentage: 0,
            discountAmount: 0,
            subtotal: mixedSubtotal,
          },
        ],
      },
      payments: {
        create: [
          {
            id: "seed-sale-mixed-payment-cash",
            method: PaymentMethod.CASH,
            amount: mixedCash,
          },
          {
            id: "seed-sale-mixed-payment-card",
            method: PaymentMethod.CARD,
            amount: mixedCard,
          },
        ],
      },
    },
    update: {
      status: SaleStatus.COMPLETED,
      subtotal: mixedSubtotal,
      total: mixedSubtotal,
    },
  });

  await prisma.$transaction(async (tx) => {
    await recordMovementIfAbsent(
      tx,
      {
        id: "seed-movement-sale-mixed-leche",
        branchId: norte.id,
        productId: leche.id,
        type: InventoryMovementType.SALE,
        quantity: mixedQty,
        saleId: SEED_IDS.saleMixed,
        performedByEmployeeId: cashier.id,
      },
      -mixedQty,
    );
  });

  const creditQty = 5;
  const creditSubtotal = combo.price * creditQty;
  const creditPayment = 2000;
  const creditBalance = creditSubtotal - creditPayment;

  await prisma.sale.upsert({
    where: { id: SEED_IDS.saleCredit },
    create: {
      id: SEED_IDS.saleCredit,
      branchId: norte.id,
      customerId: juan.id,
      cashierId: cashier.id,
      cashShiftId: openShiftId,
      ncfSequenceId,
      ncf: "B0200000003",
      ncfType: NcfType.CONSUMIDOR_FINAL,
      subtotal: creditSubtotal,
      taxAmount: 0,
      total: creditSubtotal,
      status: SaleStatus.COMPLETED,
      items: {
        create: [
          {
            id: "seed-sale-credit-item-combo",
            productId: combo.id,
            quantity: creditQty,
            unitPrice: combo.price,
            discountPercentage: 0,
            discountAmount: 0,
            subtotal: creditSubtotal,
          },
        ],
      },
      payments: {
        create: [
          {
            id: "seed-sale-credit-payment",
            method: PaymentMethod.CREDIT,
            amount: creditSubtotal,
          },
        ],
      },
    },
    update: {
      status: SaleStatus.COMPLETED,
      subtotal: creditSubtotal,
      total: creditSubtotal,
    },
  });

  await prisma.$transaction(async (tx) => {
    await recordMovementIfAbsent(
      tx,
      {
        id: "seed-movement-sale-credit-combo",
        branchId: norte.id,
        productId: combo.id,
        type: InventoryMovementType.SALE,
        quantity: creditQty,
        saleId: SEED_IDS.saleCredit,
        performedByEmployeeId: cashier.id,
      },
      -creditQty,
    );
  });

  await prisma.accountReceivable.upsert({
    where: { id: SEED_IDS.accountReceivable },
    create: {
      id: SEED_IDS.accountReceivable,
      customerId: juan.id,
      saleId: SEED_IDS.saleCredit,
      originalAmount: creditSubtotal,
      balance: creditBalance,
      dueDate: daysFromNow(30),
      status: ReceivableStatus.PARTIAL,
    },
    update: {
      originalAmount: creditSubtotal,
      balance: creditBalance,
      status: ReceivableStatus.PARTIAL,
    },
  });

  await prisma.receivablePayment.upsert({
    where: { id: SEED_IDS.receivablePayment },
    create: {
      id: SEED_IDS.receivablePayment,
      accountReceivableId: SEED_IDS.accountReceivable,
      amount: creditPayment,
      method: PaymentMethod.CASH,
      notes: "Abono parcial en caja",
    },
    update: {
      amount: creditPayment,
      method: PaymentMethod.CASH,
    },
  });

  await prisma.sale.upsert({
    where: { id: SEED_IDS.salePending },
    create: {
      id: SEED_IDS.salePending,
      branchId: norte.id,
      cashierId: cashier.id,
      subtotal: cola355.price,
      taxAmount: 0,
      total: cola355.price,
      status: SaleStatus.PENDING,
      items: {
        create: [
          {
            id: "seed-sale-pending-item-cola",
            productId: cola355.id,
            quantity: 1,
            unitPrice: cola355.price,
            subtotal: cola355.price,
          },
        ],
      },
    },
    update: {
      status: SaleStatus.PENDING,
      total: cola355.price,
    },
  });

  await prisma.sale.upsert({
    where: { id: SEED_IDS.saleCancelled },
    create: {
      id: SEED_IDS.saleCancelled,
      branchId: norte.id,
      cashierId: cashier.id,
      subtotal: lays.price * 2,
      taxAmount: 0,
      total: lays.price * 2,
      status: SaleStatus.CANCELLED,
      items: {
        create: [
          {
            id: "seed-sale-cancelled-item-lays",
            productId: lays.id,
            quantity: 2,
            unitPrice: lays.price,
            subtotal: lays.price * 2,
          },
        ],
      },
    },
    update: {
      status: SaleStatus.CANCELLED,
    },
  });

  const maria = customers.find((c) => c.id === SEED_IDS.customerMaria);
  if (!maria) {
    throw new Error("Cliente Maria no encontrado.");
  }

  const reservationLaysQty = 5;
  const reservationSaleSubtotal = lays.price * reservationLaysQty;

  await prisma.sale.upsert({
    where: { id: SEED_IDS.saleFromReservation },
    create: {
      id: SEED_IDS.saleFromReservation,
      branchId: norte.id,
      customerId: maria.id,
      cashierId: cashier.id,
      cashShiftId: openShiftId,
      reservationId: SEED_IDS.reservationCompleted,
      subtotal: reservationSaleSubtotal,
      taxAmount: 0,
      total: reservationSaleSubtotal,
      status: SaleStatus.COMPLETED,
      items: {
        create: [
          {
            id: "seed-sale-from-reservation-item-lays",
            productId: lays.id,
            quantity: reservationLaysQty,
            unitPrice: lays.price,
            discountPercentage: 0,
            discountAmount: 0,
            subtotal: reservationSaleSubtotal,
          },
        ],
      },
      payments: {
        create: [
          {
            id: "seed-sale-from-reservation-payment",
            method: PaymentMethod.CASH,
            amount: reservationSaleSubtotal,
          },
        ],
      },
    },
    update: {
      reservationId: SEED_IDS.reservationCompleted,
      status: SaleStatus.COMPLETED,
    },
  });

  await prisma.$transaction(async (tx) => {
    await recordMovementIfAbsent(
      tx,
      {
        id: "seed-movement-sale-from-reservation-lays",
        branchId: norte.id,
        productId: lays.id,
        type: InventoryMovementType.SALE,
        quantity: reservationLaysQty,
        saleId: SEED_IDS.saleFromReservation,
        performedByEmployeeId: cashier.id,
      },
      -reservationLaysQty,
    );
  });
}

async function ensureDemoTransfer(ctx: SeedContext) {
  const centro = branchByName(ctx, "Sucursal Centro");
  const norte = branchByName(ctx, "Sucursal Norte");
  const cola355 = productByCode(ctx, "BEB-COLA-355");
  const inventoryAssistant = employeeByEmail(ctx, "inventario@ejemplo.com");
  const transferQty = 20;

  await prisma.transfer.upsert({
    where: { id: SEED_IDS.transferCompleted },
    create: {
      id: SEED_IDS.transferCompleted,
      fromBranchId: centro.id,
      toBranchId: norte.id,
      status: TransferStatus.COMPLETED,
      notes: "Traslado inicial de Coca-Cola a sucursal Norte",
      items: {
        create: [
          {
            id: "seed-transfer-item-cola",
            productId: cola355.id,
            quantity: transferQty,
          },
        ],
      },
    },
    update: {
      status: TransferStatus.COMPLETED,
    },
  });

  await prisma.$transaction(async (tx) => {
    await recordMovementIfAbsent(
      tx,
      {
        id: "seed-movement-transfer-out-cola",
        branchId: centro.id,
        productId: cola355.id,
        type: InventoryMovementType.TRANSFER_OUT,
        quantity: transferQty,
        transferId: SEED_IDS.transferCompleted,
        performedByEmployeeId: inventoryAssistant.id,
      },
      -transferQty,
    );
    await recordMovementIfAbsent(
      tx,
      {
        id: "seed-movement-transfer-in-cola",
        branchId: norte.id,
        productId: cola355.id,
        type: InventoryMovementType.TRANSFER_IN,
        quantity: transferQty,
        transferId: SEED_IDS.transferCompleted,
        performedByEmployeeId: inventoryAssistant.id,
      },
      transferQty,
    );
  });
}

async function ensureDemoReturn(ctx: SeedContext) {
  const norte = branchByName(ctx, "Sucursal Norte");
  const cashier = employeeByEmail(ctx, "cajero@ejemplo.com");
  const cola355 = productByCode(ctx, "BEB-COLA-355");
  const returnQty = 1;
  const returnSubtotal = cola355.price;

  await prisma.return.upsert({
    where: { id: SEED_IDS.returnFromSale },
    create: {
      id: SEED_IDS.returnFromSale,
      branchId: norte.id,
      saleId: SEED_IDS.saleCash,
      employeeId: cashier.id,
      reason: ReturnReason.DEFECTIVE,
      notes: "Lata abollada — devolución parcial de venta en efectivo",
      subtotal: returnSubtotal,
      total: returnSubtotal,
      items: {
        create: [
          {
            id: "seed-return-item-cola",
            productId: cola355.id,
            quantity: returnQty,
            subtotal: returnSubtotal,
          },
        ],
      },
    },
    update: {
      reason: ReturnReason.DEFECTIVE,
      subtotal: returnSubtotal,
      total: returnSubtotal,
    },
  });

  await prisma.$transaction(async (tx) => {
    await recordMovementIfAbsent(
      tx,
      {
        id: "seed-movement-return-cola",
        branchId: norte.id,
        productId: cola355.id,
        type: InventoryMovementType.RETURN,
        quantity: returnQty,
        returnId: SEED_IDS.returnFromSale,
        performedByEmployeeId: cashier.id,
      },
      returnQty,
    );
  });
}

async function ensureDemoRefreshTokens(ownerUserId: string) {
  const activeTokenId = "seed-refresh-token-active";
  const revokedTokenId = "seed-refresh-token-revoked";
  const hashedActive = await hashPassword("seed-active-refresh-token");
  const hashedRevoked = await hashPassword("seed-revoked-refresh-token");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.upsert({
    where: { id: activeTokenId },
    create: {
      id: activeTokenId,
      userId: ownerUserId,
      hashedToken: hashedActive,
      expiresAt,
      userAgent: "seed-script",
      createdByIp: "127.0.0.1",
    },
    update: {
      hashedToken: hashedActive,
      expiresAt,
      revoked: false,
      revokedAt: null,
    },
  });

  await prisma.refreshToken.upsert({
    where: { id: revokedTokenId },
    create: {
      id: revokedTokenId,
      userId: ownerUserId,
      hashedToken: hashedRevoked,
      expiresAt,
      revoked: true,
      revokedAt: new Date(),
      userAgent: "seed-script",
      createdByIp: "127.0.0.1",
      replacedByTokenId: activeTokenId,
    },
    update: {
      hashedToken: hashedRevoked,
      revoked: true,
      revokedAt: new Date(),
      replacedByTokenId: activeTokenId,
    },
  });

  return 2;
}

async function ensureDemoAuditLogs(ctx: SeedContext) {
  const centro = branchByName(ctx, "Sucursal Centro");
  const norte = branchByName(ctx, "Sucursal Norte");
  const cola355 = productByCode(ctx, "BEB-COLA-355");

  const entries = [
    {
      id: "seed-audit-company-created",
      action: "COMPANY_CREATED",
      entity: "Company",
      entityId: ctx.companyId,
      metadata: { source: "seed", slug: DEMO_COMPANY_SLUG },
    },
    {
      id: "seed-audit-product-created",
      action: "PRODUCT_CREATED",
      entity: "Product",
      entityId: cola355.id,
      metadata: { source: "seed", code: cola355.code },
    },
    {
      id: "seed-audit-purchase-registered",
      action: "PURCHASE_REGISTERED",
      entity: "Purchase",
      entityId: SEED_IDS.purchaseInitial,
      branchId: centro.id,
      metadata: { source: "seed", invoiceNumber: "FAC-BC-2026-001" },
    },
    {
      id: "seed-audit-sale-completed",
      action: "SALE_COMPLETED",
      entity: "Sale",
      entityId: SEED_IDS.saleCash,
      branchId: norte.id,
      metadata: { source: "seed", ncf: "B0200000001" },
    },
    {
      id: "seed-audit-transfer-completed",
      action: "TRANSFER_COMPLETED",
      entity: "Transfer",
      entityId: SEED_IDS.transferCompleted,
      branchId: centro.id,
      metadata: { source: "seed", quantity: 20 },
    },
    {
      id: "seed-audit-return-created",
      action: "RETURN_CREATED",
      entity: "Return",
      entityId: SEED_IDS.returnFromSale,
      branchId: norte.id,
      metadata: { source: "seed", reason: "DEFECTIVE" },
    },
    {
      id: "seed-audit-user-login",
      action: "USER_LOGIN",
      entity: "User",
      entityId: ctx.ownerUserId,
      metadata: { source: "seed", ip: "127.0.0.1" },
    },
  ] as const;

  for (const entry of entries) {
    await prisma.auditLog.upsert({
      where: { id: entry.id },
      create: {
        ...entry,
        companyId: ctx.companyId,
        userId: ctx.ownerUserId,
      },
      update: {
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        branchId: "branchId" in entry ? entry.branchId : undefined,
        metadata: entry.metadata,
      },
    });
  }

  return entries.length;
}

async function main(): Promise<void> {
  const password = process.env.SEED_USER_PASSWORD ?? DEFAULT_SEED_PASSWORD;

  await ensureRoles();
  await ensurePermissions();
  await ensureRolePermissions();
  const company = await ensureDemoCompany();
  const branches = await ensureDemoBranches(company.id);

  await ensureSuperAdminUser(
    SUPER_ADMIN_USER.email,
    password,
    SUPER_ADMIN_USER.firstName,
    SUPER_ADMIN_USER.lastName,
  );

  const users: { email: string; id: string }[] = [];
  for (const seedUser of DEMO_USERS) {
    const user = await ensureUser(
      seedUser.email,
      password,
      seedUser.firstName,
      seedUser.lastName,
    );
    const defaultBranchId = seedUser.defaultBranchName
      ? branches.get(seedUser.defaultBranchName)?.id
      : undefined;

    await linkUserToCompany(
      seedUser.email,
      company.id,
      seedUser.role,
      defaultBranchId,
    );
    users.push({ email: user.email, id: user.id });
  }

  const owner = users[0];
  if (!owner) {
    throw new Error("No se pudo crear el usuario OWNER del seed.");
  }

  const suppliers = await ensureDemoSuppliers(company.id);
  const categories = await ensureDemoCategories(company.id);
  const products = await ensureDemoProducts(company.id, categories, suppliers);
  const productsByCode = new Map(
    products.map((product) => [product.code, product]),
  );
  const employees = await ensureDemoEmployees(company.id, branches, password);

  const ctx: SeedContext = {
    companyId: company.id,
    branches,
    products,
    productsByCode,
    employees,
    ownerUserId: owner.id,
  };

  const customers = await ensureDemoCustomers(company.id);
  await ensureDemoNcfSequence(company.id);
  await ensureDemoDiscounts(company.id, categories, productsByCode);
  await ensureDemoCashRegisters(ctx);
  await ensureDemoCashShifts(ctx);

  // Transferencia antes de ventas para stock en Norte
  await ensureDemoTransfer(ctx);
  await ensureDemoPurchases(ctx, suppliers);
  await ensureDemoReservations(ctx, customers);
  await ensureDemoSalesAndFinance(ctx, customers);
  await ensureDemoReturn(ctx);

  const refreshTokens = await ensureDemoRefreshTokens(owner.id);
  const auditLogs = await ensureDemoAuditLogs(ctx);

  const counts = await prisma.$transaction([
    prisma.customer.count({ where: { companyId: company.id } }),
    prisma.ncfSequence.count({ where: { companyId: company.id } }),
    prisma.discount.count({ where: { companyId: company.id } }),
    prisma.discountExcludedProduct.count(),
    prisma.inventory.count(),
    prisma.inventoryMovement.count(),
    prisma.reservation.count(),
    prisma.reservationItem.count(),
    prisma.cashRegister.count(),
    prisma.cashShift.count(),
    prisma.purchase.count(),
    prisma.sale.count(),
    prisma.payment.count(),
    prisma.accountReceivable.count(),
    prisma.receivablePayment.count(),
    prisma.accountPayable.count(),
    prisma.payablePayment.count(),
    prisma.transfer.count(),
    prisma.return.count(),
  ]);

  console.log("Seed completado:");
  console.log(`  permisos: ${ALL_PERMISSIONS.length}`);
  console.log(`  empresa: ${company.name} (${company.slug})`);
  console.log(`  sucursales: ${branches.size}`);
  console.log(`  usuarios tenant: ${users.length} (password: ${password})`);
  console.log(
    `  super admin: ${SUPER_ADMIN_USER.email} (password: ${password}, sin empresa)`,
  );
  console.log(`  proveedores: ${suppliers.size}`);
  console.log(`  categorías: ${categories.size}`);
  console.log(`  productos: ${products.length}`);
  console.log(`  empleados: ${employees.length}`);
  console.log(`  clientes: ${counts[0]}`);
  console.log(`  secuencias NCF: ${counts[1]}`);
  console.log(`  descuentos: ${counts[2]} (exclusiones: ${counts[3]})`);
  console.log(
    `  inventario: ${counts[4]} registros, ${counts[5]} movimientos, ${counts[6]} reservas (${counts[7]} líneas)`,
  );
  console.log(`  cajas: ${counts[8]}, turnos: ${counts[9]}`);
  console.log(`  compras registradas: ${counts[10]}`);
  console.log(`  ventas: ${counts[11]}, pagos: ${counts[12]}`);
  console.log(`  CxC: ${counts[13]} (abonos: ${counts[14]})`);
  console.log(`  CxP: ${counts[15]} (pagos: ${counts[16]})`);
  console.log(`  transferencias: ${counts[17]}, devoluciones: ${counts[18]}`);
  console.log(`  refresh tokens: ${refreshTokens}`);
  console.log(`  audit logs: ${auditLogs}`);
  console.log("Vuelve a hacer login para refrescar el contexto JWT.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
