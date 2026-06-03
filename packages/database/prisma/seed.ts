/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable no-console */
/**
 * Seed de desarrollo: datos de ejemplo para todos los modelos del schema.
 *
 * Uso:
 *   pnpm --filter @repo/db run db:seed:dev
 *
 * Credenciales:
 *   prueba@ejemplo.com / Password123  (OWNER)
 *   admin@ejemplo.com / Password123   (ADMIN)
 *   cajero@ejemplo.com / Password123    (CASHIER, vinculado a Employee)
 */
import bcrypt from "bcrypt";
import { prisma } from "../src/client.js";
import { RoleName } from "../src/generated/prisma/client.js";

const DEMO_COMPANY_SLUG = "empresa-demo";
const DEFAULT_SEED_PASSWORD = "Password123";
const ALL_ROLES = Object.values(RoleName);
const PASSWORD_HASH_ROUNDS = 10;

type SeedUser = {
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  defaultBranchName?: string;
};

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
    email: "cajero@ejemplo.com",
    firstName: "Carlos",
    lastName: "Ruiz",
    role: RoleName.CASHIER,
    defaultBranchName: "Sucursal Norte",
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

type DemoProduct = {
  code: string;
  name: string;
  description: string;
  price: number;
  categoryNames: string[];
  supplierName?: string;
};

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    code: "BEB-COLA-355",
    name: "Coca-Cola 355 ml",
    description: "Refresco de cola lata",
    price: 45.0,
    categoryNames: ["Bebidas"],
    supplierName: "Bebidas Caribeña",
  },
  {
    code: "SNK-LAYS-40",
    name: "Papas Lay's clásicas 40 g",
    description: "Papas fritas individuales",
    price: 65.0,
    categoryNames: ["Snacks"],
    supplierName: "Distribuidora Nacional SRL",
  },
  {
    code: "LAC-LECHE-1L",
    name: "Leche entera 1 L",
    description: "Leche UHT entera",
    price: 55.0,
    categoryNames: ["Lácteos"],
    supplierName: "Alimentos del Cibao SA",
  },
  {
    code: "COMBO-SNACK-BEB",
    name: "Combo snack + bebida",
    description: "Promoción: papas + refresco",
    price: 99.0,
    categoryNames: ["Snacks", "Bebidas"],
    supplierName: "Distribuidora Nacional SRL",
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

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
}

async function ensureRoles(): Promise<void> {
  for (const name of ALL_ROLES) {
    const existing = await prisma.role.findFirst({ where: { name } });
    if (!existing) {
      await prisma.role.create({ data: { name } });
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
  const byName = new Map<string, { id: string; name: string }>();

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

async function ensureDemoProducts(
  companyId: string,
  categoriesByName: Map<string, { id: string; name: string }>,
  suppliersByName: Map<string, { id: string; name: string }>,
) {
  const created: { code: string; id: string; name: string }[] = [];

  for (const item of DEMO_PRODUCTS) {
    const categoryIds = item.categoryNames.map((name) => {
      const category = categoriesByName.get(name);
      if (!category) {
        throw new Error(`Categoría seed "${name}" no encontrada`);
      }
      return category.id;
    });

    const supplierId = item.supplierName
      ? suppliersByName.get(item.supplierName)?.id
      : undefined;

    const existing = await prisma.product.findFirst({
      where: { companyId, code: item.code, deletedAt: null },
      select: { id: true, code: true, name: true },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          supplierId,
          categories: { set: categoryIds.map((id) => ({ id })) },
        },
      });
      created.push(existing);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        companyId,
        code: item.code,
        name: item.name,
        description: item.description,
        price: item.price,
        supplierId,
        categories: {
          connect: categoryIds.map((id) => ({ id })),
        },
      },
      select: { id: true, code: true, name: true },
    });
    created.push(product);
  }

  return created;
}

async function ensureDemoEmployees(
  companyId: string,
  branchesByName: Map<string, { id: string; name: string }>,
  password: string,
) {
  const created: { id: string; name: string; email: string }[] = [];

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

    const existing = await prisma.employee.findFirst({
      where: { companyId, userId: user.id, deletedAt: null },
      select: { id: true },
    });

    const data = {
      companyId,
      branchId: branch.id,
      userId: user.id,
      phone: employee.phone ?? null,
      position: employee.position,
      salary: employee.salary,
      hireDate: employee.hireDate,
    };

    if (existing) {
      await prisma.employee.update({
        where: { id: existing.id },
        data,
      });
      created.push({
        id: existing.id,
        name: `${employee.firstName} ${employee.lastName}`,
        email,
      });
      continue;
    }

    const record = await prisma.employee.create({
      data,
      select: { id: true },
    });

    created.push({
      id: record.id,
      name: `${employee.firstName} ${employee.lastName}`,
      email,
    });
  }

  return created;
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

async function ensureDemoAuditLogs(
  companyId: string,
  ownerUserId: string,
  productId: string,
  employeeId: string,
) {
  const entries = [
    {
      id: "seed-audit-company-created",
      action: "COMPANY_CREATED",
      entity: "Company",
      entityId: companyId,
      metadata: { source: "seed", slug: DEMO_COMPANY_SLUG },
    },
    {
      id: "seed-audit-product-created",
      action: "PRODUCT_CREATED",
      entity: "Product",
      entityId: productId,
      metadata: { source: "seed", code: DEMO_PRODUCTS[0]?.code },
    },
    {
      id: "seed-audit-employee-created",
      action: "EMPLOYEE_CREATED",
      entity: "Employee",
      entityId: employeeId,
      metadata: { source: "seed", position: DEMO_EMPLOYEES[0]?.position },
    },
    {
      id: "seed-audit-user-login",
      action: "USER_LOGIN",
      entity: "User",
      entityId: ownerUserId,
      metadata: { source: "seed", ip: "127.0.0.1" },
    },
  ] as const;

  for (const entry of entries) {
    await prisma.auditLog.upsert({
      where: { id: entry.id },
      create: {
        ...entry,
        companyId,
        userId: ownerUserId,
      },
      update: {
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        metadata: entry.metadata,
      },
    });
  }

  return entries.length;
}

async function main(): Promise<void> {
  const password = process.env.SEED_USER_PASSWORD ?? DEFAULT_SEED_PASSWORD;

  await ensureRoles();
  const company = await ensureDemoCompany();
  const branches = await ensureDemoBranches(company.id);

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
  const employees = await ensureDemoEmployees(company.id, branches, password);
  const refreshTokens = await ensureDemoRefreshTokens(owner.id);
  const auditLogs = await ensureDemoAuditLogs(
    company.id,
    owner.id,
    products[0]?.id ?? "",
    employees[0]?.id ?? "",
  );

  console.log("Seed completado:");
  console.log(`  empresa: ${company.name} (${company.slug})`);
  console.log(`  sucursales: ${branches.size}`);
  for (const branch of branches.values()) {
    console.log(`    - ${branch.name} (${branch.id})`);
  }
  console.log(`  usuarios: ${users.length} (password: ${password})`);
  for (const user of users) {
    const membership = DEMO_USERS.find((item) => item.email === user.email);
    console.log(`    - ${user.email} [${membership?.role ?? "?"}]`);
  }
  console.log(`  proveedores: ${suppliers.size}`);
  for (const supplier of suppliers.values()) {
    console.log(`    - ${supplier.name} (${supplier.id})`);
  }
  console.log(`  categorías: ${categories.size}`);
  for (const category of categories.values()) {
    console.log(`    - ${category.name} (${category.id})`);
  }
  console.log(`  productos: ${products.length}`);
  for (const product of products) {
    console.log(`    - ${product.code} — ${product.name} (${product.id})`);
  }
  console.log(`  empleados: ${employees.length}`);
  for (const employee of employees) {
    console.log(`    - ${employee.name} <${employee.email}> (${employee.id})`);
  }
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
