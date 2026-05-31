/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable no-console */
/**
 * Seed de desarrollo: roles, empresa demo, membresía, categorías y productos.
 *
 * Uso:
 *   pnpm --filter @repo/db run db:seed:dev
 *   Login: prueba@ejemplo.com / Password123 (o SEED_USER_EMAIL / SEED_USER_PASSWORD)
 */
import bcrypt from "bcrypt";
import { prisma } from "../src/client.js";
import { RoleName } from "../src/generated/prisma/client.js";

const DEMO_COMPANY_SLUG = "empresa-demo";
const DEFAULT_SEED_EMAIL = "prueba@ejemplo.com";
const DEFAULT_SEED_PASSWORD = "Password123";
const ALL_ROLES = Object.values(RoleName);

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
};

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    code: "BEB-COLA-355",
    name: "Coca-Cola 355 ml",
    description: "Refresco de cola lata",
    price: 45.0,
    categoryNames: ["Bebidas"],
  },
  {
    code: "SNK-LAYS-40",
    name: "Papas Lay's clásicas 40 g",
    description: "Papas fritas individuales",
    price: 65.0,
    categoryNames: ["Snacks"],
  },
  {
    code: "LAC-LECHE-1L",
    name: "Leche entera 1 L",
    description: "Leche UHT entera",
    price: 55.0,
    categoryNames: ["Lácteos"],
  },
  {
    code: "COMBO-SNACK-BEB",
    name: "Combo snack + bebida",
    description: "Promoción: papas + refresco",
    price: 99.0,
    categoryNames: ["Snacks", "Bebidas"],
  },
];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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
  if (existing) {
    return existing;
  }
  return prisma.company.create({
    data: {
      name: "Empresa Demo",
      slug: DEMO_COMPANY_SLUG,
    },
  });
}

async function ensureDemoUser(email: string, password: string) {
  const normalized = normalizeEmail(email);
  const existing = await prisma.user.findFirst({
    where: { email: normalized, deletedAt: null },
    select: { id: true, email: true },
  });

  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      firstName: "Usuario",
      lastName: "Demo",
    },
    select: { id: true, email: true },
  });
}

async function linkUserToCompany(
  email: string,
  companyId: string,
  roleId: string,
): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { email: normalizeEmail(email) },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new Error(`Usuario "${email}" no encontrado tras ensureDemoUser.`);
  }

  const membership = await prisma.userCompany.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });

  if (membership) {
    await prisma.userCompany.update({
      where: { id: membership.id },
      data: { companyId, roleId },
    });
    return;
  }

  await prisma.userCompany.create({
    data: {
      userId: user.id,
      companyId,
      roleId,
    },
  });
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

async function main(): Promise<void> {
  const email = process.env.SEED_USER_EMAIL ?? DEFAULT_SEED_EMAIL;
  const password = process.env.SEED_USER_PASSWORD ?? DEFAULT_SEED_PASSWORD;

  await ensureRoles();
  const company = await ensureDemoCompany();
  const ownerRole = await prisma.role.findFirstOrThrow({
    where: { name: RoleName.OWNER },
    select: { id: true },
  });

  const user = await ensureDemoUser(email, password);
  await linkUserToCompany(email, company.id, ownerRole.id);

  const categories = await ensureDemoCategories(company.id);
  const products = await ensureDemoProducts(company.id, categories);

  console.log("Seed completado:");
  console.log(`  usuario: ${user.email}`);
  console.log(`  password: ${password}`);
  console.log(`  empresa: ${company.name} (${company.slug})`);
  console.log(`  rol: OWNER`);
  console.log(`  categorías: ${categories.size}`);
  for (const cat of categories.values()) {
    console.log(`    - ${cat.name} (${cat.id})`);
  }
  console.log(`  productos: ${products.length}`);
  for (const product of products) {
    console.log(`    - ${product.code} — ${product.name} (${product.id})`);
  }
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
