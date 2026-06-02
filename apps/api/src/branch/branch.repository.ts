import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { prisma } from '@repo/db';

import { type BranchRecord, branchSelect } from './branch.selects';

export type { BranchRecord } from './branch.selects';

export type CreateBranchData = {
  name: string;
  address: string | null;
};

export type UpdateBranchData = {
  name?: string;
  address?: string | null;
};

@Injectable()
export class BranchRepository {
  findManyByCompany(companyId: string): Promise<BranchRecord[]> {
    return prisma.branch.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      select: branchSelect,
    });
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<BranchRecord | null> {
    return prisma.branch.findFirst({
      where: { id, companyId },
      select: branchSelect,
    });
  }

  create(companyId: string, data: CreateBranchData): Promise<BranchRecord> {
    return prisma.branch.create({
      data: {
        companyId,
        name: data.name,
        address: data.address,
      },
      select: branchSelect,
    });
  }

  update(id: string, data: Prisma.BranchUpdateInput): Promise<BranchRecord> {
    return prisma.branch.update({
      where: { id },
      data,
      select: branchSelect,
    });
  }

  activate(id: string) {
    return prisma.branch.activate({ where: { id } });
  }

  deactivate(id: string) {
    return prisma.branch.deactivate({ where: { id } });
  }

  softDelete(id: string) {
    return prisma.branch.softDelete({ where: { id } });
  }
}
