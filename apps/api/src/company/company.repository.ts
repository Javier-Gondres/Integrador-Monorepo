import { Injectable } from '@nestjs/common';
import { prisma, RoleName } from '@repo/db';

import { ensureEmployeeForUserRole } from '../common/employees/employee-provisioning';
import { createDefaultNcfSequences } from '../common/ncf/ncf-provisioning.helper';
import { assertUserEligibleForTenantMembership } from '../common/platform';
import {
  type CompanyRecord,
  companySelect,
  type CompanyWithBranchesRecord,
  companyWithBranchesSelect,
} from './company.selects';

export type {
  CompanyRecord,
  CompanyWithBranchesRecord,
} from './company.selects';

export type CreateCompanyData = {
  name: string;
  slug: string;
  rnc: string | null;
};

export type CreateCompanyWithOnboardingData = CreateCompanyData & {
  userId: string;
  defaultBranchName: string;
};

export type UpdateCompanyData = {
  name?: string;
  rnc?: string | null;
  email?: string | null;
  phone?: string | null;
};

@Injectable()
export class CompanyRepository {
  findById(id: string): Promise<CompanyRecord | null> {
    return prisma.company.findFirst({
      where: { id },
      select: companySelect,
    });
  }

  findByIdWithBranches(id: string): Promise<CompanyWithBranchesRecord | null> {
    return prisma.company.findFirst({
      where: { id },
      select: companyWithBranchesSelect,
    });
  }

  findBySlug(slug: string): Promise<CompanyRecord | null> {
    return prisma.company.findFirst({
      where: { slug },
      select: companySelect,
    });
  }

  findDuplicateBySlugOrRnc(
    slug: string,
    rnc: string | null,
    excludeId?: string,
  ) {
    return prisma.company.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        OR: [{ slug }, ...(rnc ? [{ rnc }] : [])],
      },
      select: { id: true, slug: true, rnc: true },
    });
  }

  findDuplicateRnc(rnc: string, excludeId: string) {
    return prisma.company.findFirst({
      where: {
        id: { not: excludeId },
        rnc,
      },
      select: { id: true },
    });
  }

  private readonly myCompanyMembershipSelect = {
    defaultBranchId: true,
    role: { select: { name: true } },
    company: {
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
      },
    },
  } as const;

  findMyCompanyForUser(userId: string) {
    return prisma.userCompany.findFirst({
      where: { userId },
      select: this.myCompanyMembershipSelect,
    });
  }

  findMyCompaniesForUser(userId: string) {
    return prisma.userCompany.findMany({
      where: { userId },
      select: this.myCompanyMembershipSelect,
      orderBy: { company: { name: 'asc' } },
    });
  }

  async hasActiveMembership(userId: string): Promise<boolean> {
    const row = await prisma.userCompany.findFirst({
      where: { userId },
      select: { id: true },
    });
    return row !== null;
  }

  async userHasMembershipInCompany(
    userId: string,
    companyId: string,
  ): Promise<boolean> {
    const row = await prisma.userCompany.findFirst({
      where: { userId, companyId },
      select: { id: true },
    });
    return row !== null;
  }

  createWithOnboarding(
    data: CreateCompanyWithOnboardingData,
  ): Promise<CompanyWithBranchesRecord> {
    return prisma.$transaction(async (tx) => {
      const actor = await tx.user.findUnique({
        where: { id: data.userId },
        select: { isSuperAdmin: true },
      });

      assertUserEligibleForTenantMembership(actor?.isSuperAdmin ?? false);

      const ownerRole = await tx.role.findFirst({
        where: { name: RoleName.OWNER },
        select: { id: true },
      });

      if (!ownerRole) {
        throw new Error('OWNER role not found');
      }

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

      await createDefaultNcfSequences(tx, company.id);

      await tx.userCompany.create({
        data: {
          userId: data.userId,
          companyId: company.id,
          roleId: ownerRole.id,
          defaultBranchId: defaultBranch.id,
        },
      });

      await ensureEmployeeForUserRole(tx, {
        userId: data.userId,
        companyId: company.id,
        branchId: defaultBranch.id,
        roleName: RoleName.OWNER,
      });

      return company;
    });
  }

  update(id: string, data: UpdateCompanyData): Promise<CompanyRecord> {
    return prisma.company.update({
      where: { id },
      data,
      select: companySelect,
    });
  }

  activate(id: string) {
    return prisma.company.activate({ where: { id } });
  }

  deactivate(id: string) {
    return prisma.company.deactivate({ where: { id } });
  }

  softDelete(id: string) {
    return prisma.company.softDelete({ where: { id } });
  }
}
