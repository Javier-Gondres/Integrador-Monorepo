import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class MeRepository {
  updateDefaultBranch(userId: string, companyId: string, branchId: string) {
    return prisma.userCompany.updateMany({
      where: { userId, companyId },
      data: { defaultBranchId: branchId },
    });
  }
}
