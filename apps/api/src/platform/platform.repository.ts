import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { prisma, RoleName } from '@repo/db';

import type { PaginatedResult } from '../common/types/repository.types';
import { companyWithBranchesSelect } from '../company/company.selects';
import type { NormalizedQueryPlatformCompanies } from './dto/query-platform-companies.dto';
import {
  type PlatformCompanyListRecord,
  platformCompanyListSelect,
} from './platform.selects';

export type PaginatedPlatformCompaniesResult =
  PaginatedResult<PlatformCompanyListRecord>;

export type CreatePlatformCompanyData = {
  name: string;
  slug: string;
  rnc: string | null;
  defaultBranchName: string;
  owner: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  };
};

export type CreatePlatformCompanyResult =
  | { status: 'ok'; company: Prisma.CompanyGetPayload<{ select: typeof companyWithBranchesSelect }> }
  | { status: 'duplicate_company' }
  | { status: 'duplicate_email' }
  | { status: 'role_not_found' };

@Injectable()
export class PlatformRepository {
  async findOverview() {
    const [totalCompanies, activeCompanies] = await prisma.$transaction([
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
    ]);

    return {
      totalCompanies,
      activeCompanies,
      inactiveCompanies: totalCompanies - activeCompanies,
    };
  }

  async findPaginated(
    query: NormalizedQueryPlatformCompanies,
  ): Promise<PaginatedPlatformCompaniesResult> {
    const where = this.buildListWhere(query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.company.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { name: 'asc' },
        select: platformCompanyListSelect,
      }),
      prisma.company.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: string) {
    return prisma.company.findFirst({
      where: { id },
      select: companyWithBranchesSelect,
    });
  }

  findDuplicateBySlugOrRnc(slug: string, rnc: string | null) {
    return prisma.company.findFirst({
      where: {
        OR: [{ slug }, ...(rnc ? [{ rnc }] : [])],
      },
      select: { id: true },
    });
  }

  findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });
  }

  createCompanyWithOwner(
    data: CreatePlatformCompanyData,
  ): Promise<CreatePlatformCompanyResult> {
    return prisma.$transaction(async (tx) => {
      const ownerRole = await tx.role.findFirst({
        where: { name: RoleName.OWNER },
        select: { id: true },
      });

      if (!ownerRole) {
        return { status: 'role_not_found' };
      }

      const user = await tx.user.create({
        data: {
          email: data.owner.email,
          passwordHash: data.owner.passwordHash,
          firstName: data.owner.firstName,
          lastName: data.owner.lastName,
        },
        select: { id: true },
      });

      const company = await tx.company.create({
        data: {
          name: data.name,
          slug: data.slug,
          rnc: data.rnc,
          branches: {
            create: {
              name: data.defaultBranchName,
            },
          },
        },
        select: companyWithBranchesSelect,
      });

      const defaultBranch = company.branches[0];
      if (!defaultBranch) {
        throw new Error('Default branch was not created');
      }

      await tx.userCompany.create({
        data: {
          userId: user.id,
          companyId: company.id,
          roleId: ownerRole.id,
          defaultBranchId: defaultBranch.id,
        },
      });

      return { status: 'ok', company };
    });
  }

  activate(id: string) {
    return prisma.company.activate({ where: { id } });
  }

  deactivate(id: string) {
    return prisma.company.deactivate({ where: { id } });
  }

  private buildListWhere(
    query: NormalizedQueryPlatformCompanies,
  ): Prisma.CompanyWhereInput {
    const { search, isActive } = query;

    return {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          ...(search.trim()
            ? [{ rnc: { contains: search.trim(), mode: 'insensitive' as const } }]
            : []),
        ],
      }),
    };
  }
}
