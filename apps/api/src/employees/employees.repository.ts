import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { prisma, runWithDeleted } from '@repo/db';

import type { PaginatedResult } from '../common/types/repository.types';
import type { NormalizedQueryEmployees } from './dto/query-employees.dto';
import { type EmployeeRecord, employeeSelect } from './employees.selects';

export type { EmployeeRecord } from './employees.selects';
export type PaginatedEmployeesResult = PaginatedResult<EmployeeRecord>;

export type CreateEmployeeData = {
  companyId: string;
  branchId: string;
  email: string;
  passwordHash: string;
  roleId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  position: string | null;
  salary: Prisma.Decimal | null;
  hireDate: Date | null;
};

export type CreateEmployeeResult =
  | { status: 'ok'; employee: EmployeeRecord }
  | { status: 'role_not_found' }
  | { status: 'branch_not_found' };

@Injectable()
export class EmployeesRepository {
  async findPaginatedByCompany(
    companyId: string,
    query: NormalizedQueryEmployees,
  ): Promise<PaginatedEmployeesResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.employee.findMany({
        where,
        skip,
        take: query.take,
        orderBy: [
          { user: { lastName: 'asc' } },
          { user: { firstName: 'asc' } },
        ],
        select: employeeSelect,
      }),
      prisma.employee.count({ where }),
    ]);

    return { items, total };
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<EmployeeRecord | null> {
    return prisma.employee.findFirst({
      where: { id, companyId },
      select: employeeSelect,
    });
  }

  async create(data: CreateEmployeeData): Promise<CreateEmployeeResult> {
    return prisma.$transaction(async (tx) => {
      const role = await tx.role.findUnique({
        where: { id: data.roleId },
        select: { id: true },
      });
      if (!role) {
        return { status: 'role_not_found' };
      }

      const branch = await tx.branch.findFirst({
        where: { id: data.branchId, companyId: data.companyId },
        select: { id: true },
      });
      if (!branch) {
        return { status: 'branch_not_found' };
      }

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
        },
        select: { id: true },
      });

      await tx.userCompany.create({
        data: {
          userId: user.id,
          companyId: data.companyId,
          roleId: role.id,
          defaultBranchId: data.branchId,
        },
      });

      const employee = await tx.employee.create({
        data: {
          companyId: data.companyId,
          branchId: data.branchId,
          userId: user.id,
          phone: data.phone,
          position: data.position,
          salary: data.salary,
          hireDate: data.hireDate,
        },
        select: employeeSelect,
      });

      return { status: 'ok', employee };
    });
  }

  update(
    id: string,
    data: Prisma.EmployeeUpdateInput,
  ): Promise<EmployeeRecord> {
    return prisma.employee.update({
      where: { id },
      data,
      select: employeeSelect,
    });
  }

  softDelete(id: string) {
    return prisma.employee.softDelete({ where: { id } });
  }

  async restore(id: string, companyId: string): Promise<EmployeeRecord | null> {
    return runWithDeleted(async () => {
      const existing = await prisma.employee.findFirst({
        where: {
          id,
          companyId,
          deletedAt: { not: null },
        },
        select: { id: true },
      });
      if (!existing) {
        return null;
      }

      await prisma.employee.restore({ where: { id } });
      return this.findByIdInCompany(id, companyId);
    });
  }

  findBranchInCompany(branchId: string, companyId: string) {
    return prisma.branch.findFirst({
      where: { id: branchId, companyId },
      select: { id: true },
    });
  }

  private buildListWhere(
    companyId: string,
    query: NormalizedQueryEmployees,
  ): Prisma.EmployeeWhereInput {
    return {
      companyId,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.branchId && { branchId: query.branchId }),
      ...(query.search && {
        OR: [
          {
            user: {
              firstName: { contains: query.search, mode: 'insensitive' },
            },
          },
          {
            user: {
              lastName: { contains: query.search, mode: 'insensitive' },
            },
          },
          { phone: { contains: query.search, mode: 'insensitive' } },
          { position: { contains: query.search, mode: 'insensitive' } },
          {
            user: {
              email: { contains: query.search, mode: 'insensitive' },
            },
          },
        ],
      }),
    };
  }
}
