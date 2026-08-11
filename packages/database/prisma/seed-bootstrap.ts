/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable no-console */
/**
 * Bootstrap mínimo de producción: roles, permisos y SuperAdmin.
 * No crea empresa demo ni datos de prueba.
 *
 * Uso:
 *   pnpm db:seed:production:bootstrap
 *
 * Credenciales:
 *   superadmin@ejemplo.com
 *   Password: SEED_USER_PASSWORD o Password123
 */
import bcrypt from "bcrypt";
import { ALL_PERMISSIONS, ROLE_PERMISSION_MATRIX } from "@repo/shared";

import { prisma } from "../src/client.js";
import { RoleName } from "../src/generated/prisma/client.js";

const DEFAULT_SEED_PASSWORD = "Password123";
const PASSWORD_HASH_ROUNDS = 10;
const ALL_ROLES = Object.values(RoleName);

const SUPER_ADMIN_USER = {
  email: "superadmin@ejemplo.com",
  firstName: "Super",
  lastName: "Admin",
} as const;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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

async function main(): Promise<void> {
  const password = process.env.SEED_USER_PASSWORD ?? DEFAULT_SEED_PASSWORD;

  await ensureRoles();
  await ensurePermissions();
  await ensureRolePermissions();
  await ensureSuperAdminUser(
    SUPER_ADMIN_USER.email,
    password,
    SUPER_ADMIN_USER.firstName,
    SUPER_ADMIN_USER.lastName,
  );

  console.log("Bootstrap de producción completado:");
  console.log(`  roles: ${ALL_ROLES.length}`);
  console.log(`  permisos: ${ALL_PERMISSIONS.length}`);
  console.log(
    `  super admin: ${SUPER_ADMIN_USER.email} (password: ${password}, sin empresa)`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
