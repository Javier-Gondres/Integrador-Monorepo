/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable no-console */
/**
 * Seed de desarrollo: roles, empresa demo y membresía para un usuario existente.
 *
 * Uso:
 *   1. Crear usuario: POST /users (o auth.http paso 1)
 *   2. pnpm --filter @repo/db run db:seed:dev
 *   3. Login de nuevo y probar GET /users
 */
import { prisma } from "../src/client.js";
import { RoleName } from "../src/generated/prisma/client.js";

const DEMO_COMPANY_SLUG = "empresa-demo";
const ALL_ROLES = Object.values(RoleName);

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
    throw new Error(
      `Usuario "${email}" no existe. Créalo primero con POST /users.`,
    );
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

async function main(): Promise<void> {
  const email = process.env.SEED_USER_EMAIL ?? "prueba@ejemplo.com";

  await ensureRoles();
  const company = await ensureDemoCompany();
  const ownerRole = await prisma.role.findFirstOrThrow({
    where: { name: RoleName.OWNER },
    select: { id: true },
  });

  await linkUserToCompany(email, company.id, ownerRole.id);

  console.log("Seed completado:");
  console.log(`  usuario: ${email}`);
  console.log(`  empresa: ${company.name} (${company.slug})`);
  console.log(`  rol: OWNER`);
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
