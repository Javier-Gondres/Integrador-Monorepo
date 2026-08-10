import {
  type Prisma,
  Prisma as PrismaClient,
  RoleName,
  runWithDeleted,
} from '@repo/db';

type EmployeeProvisioningTx = {
  branch: {
    findFirst(args: Prisma.BranchFindFirstArgs): Promise<{ id: string } | null>;
  };
  employee: {
    findFirst(args: Prisma.EmployeeFindFirstArgs): Promise<{
      id: string;
      deletedAt?: Date | null;
      hireDate?: Date | null;
    } | null>;
    create(args: Prisma.EmployeeCreateArgs): Promise<unknown>;
    update(args: Prisma.EmployeeUpdateArgs): Promise<unknown>;
    restore?(args: Omit<Prisma.EmployeeUpdateArgs, 'data'>): Promise<unknown>;
  };
};

type EnsureEmployeeForRoleData = {
  userId: string;
  companyId: string;
  branchId?: string | null;
  roleName: RoleName;
  joinedAt?: Date;
};

type EmployeeAssignmentData = {
  companyId: string;
  branchId: string;
  position: RoleName;
  isActive: true;
  terminationDate: null;
  hireDate?: Date;
};

async function restoreAndAssignEmployee(
  tx: EmployeeProvisioningTx,
  employeeId: string,
  assignmentData: EmployeeAssignmentData,
  options?: { resetHireDate?: boolean },
): Promise<void> {
  if (tx.employee.restore) {
    await runWithDeleted(async () => {
      const deleted = await tx.employee.findFirst({
        where: { id: employeeId, deletedAt: { not: null } },
        select: { id: true },
      });

      if (deleted) {
        await tx.employee.restore!({ where: { id: employeeId } });
      }
    });
  }

  const { hireDate, ...laborFields } = assignmentData;

  await tx.employee.update({
    where: { id: employeeId },
    data: {
      ...laborFields,
      ...(options?.resetHireDate ? { hireDate: hireDate ?? new Date() } : {}),
    },
  });
}

async function upsertEmployeeForUser(
  tx: EmployeeProvisioningTx,
  data: EnsureEmployeeForRoleData,
  branchId: string,
): Promise<void> {
  const joinedAt = data.joinedAt ?? new Date();
  const assignmentData: EmployeeAssignmentData = {
    companyId: data.companyId,
    branchId,
    position: data.roleName,
    isActive: true,
    terminationDate: null,
    hireDate: joinedAt,
  };

  const restoredId = await runWithDeleted(async () => {
    const existing = await tx.employee.findFirst({
      where: { userId: data.userId },
      select: { id: true, deletedAt: true },
    });

    if (!existing) {
      return null;
    }

    await restoreAndAssignEmployee(tx, existing.id, assignmentData, {
      resetHireDate: Boolean(existing.deletedAt),
    });
    return existing.id;
  });

  if (restoredId) {
    return;
  }

  const active = await tx.employee.findFirst({
    where: { userId: data.userId },
    select: { id: true, hireDate: true },
  });

  if (active) {
    await tx.employee.update({
      where: { id: active.id },
      data: {
        companyId: assignmentData.companyId,
        branchId: assignmentData.branchId,
        position: assignmentData.position,
        isActive: assignmentData.isActive,
        terminationDate: assignmentData.terminationDate,
        ...(!active.hireDate ? { hireDate: joinedAt } : {}),
      },
    });
    return;
  }

  try {
    await tx.employee.create({
      data: {
        userId: data.userId,
        companyId: data.companyId,
        branchId,
        position: data.roleName,
        hireDate: joinedAt,
      },
    });
  } catch (error) {
    if (
      error instanceof PrismaClient.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      await runWithDeleted(async () => {
        const existing = await tx.employee.findFirst({
          where: { userId: data.userId },
          select: { id: true, deletedAt: true },
        });

        if (!existing) {
          throw error;
        }

        await restoreAndAssignEmployee(tx, existing.id, assignmentData, {
          resetHireDate: Boolean(existing.deletedAt),
        });
      });
      return;
    }

    throw error;
  }
}

export async function ensureEmployeeForUserRole(
  tx: EmployeeProvisioningTx,
  data: EnsureEmployeeForRoleData,
): Promise<void> {
  const branchId =
    data.branchId ??
    (
      await tx.branch.findFirst({
        where: { companyId: data.companyId, isActive: true },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      })
    )?.id;

  if (!branchId) {
    throw new Error('Default branch was not found for employee provisioning');
  }

  await upsertEmployeeForUser(tx, data, branchId);
}
