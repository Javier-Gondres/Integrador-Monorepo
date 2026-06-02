import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

import { publicUserSelect } from '../users/users.selects';

@Injectable()
export class MeRepository {
  findProfile(userId: string) {
    return prisma.user.findFirst({
      where: { id: userId },
      select: publicUserSelect,
    });
  }

  findMembership(userId: string, companyId: string) {
    return prisma.userCompany.findFirst({
      where: { userId, companyId },
      select: {
        id: true,
        companyId: true,
        defaultBranchId: true,
        role: { select: { name: true } },
        company: {
          select: { id: true, name: true, slug: true, isActive: true },
        },
      },
    });
  }

  updateDefaultBranch(userId: string, companyId: string, branchId: string) {
    return prisma.userCompany.updateMany({
      where: { userId, companyId },
      data: { defaultBranchId: branchId },
    });
  }
}
