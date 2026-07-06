import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class CompanyStatusRepository {
  async isCompanyActive(companyId: string): Promise<boolean> {
    const company = await prisma.company.findFirst({
      where: { id: companyId },
      select: { isActive: true },
    });

    return company?.isActive ?? false;
  }
}
