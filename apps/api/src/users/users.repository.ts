import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { prisma } from '@repo/db';

import type { NormalizedQueryUsers } from './dto/query-users.dto';
import {
  membershipRelationSelectFull,
  publicUserSelect,
  withMembership,
} from './users.selects';

export type PaginatedUsersResult = {
  items: ReturnType<typeof withMembership>[];
  total: number;
};

@Injectable()
export class UsersRepository {
  async findManyByCompany(
    companyId: string,
    query: NormalizedQueryUsers,
  ): Promise<PaginatedUsersResult> {
    const where = this.buildWhere(companyId, query);
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          ...publicUserSelect,
          memberships: {
            where: { companyId },
            select: membershipRelationSelectFull,
            take: 1,
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: rows.map((row) => withMembership(row)),
      total,
    };
  }

  private buildWhere(
    companyId: string,
    query: NormalizedQueryUsers,
  ): Prisma.UserWhereInput {
    const { search, role, isActive } = query;

    return {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      memberships: {
        some: {
          companyId,
          ...(role && { role: { name: role } }),
        },
      },
    };
  }
}
