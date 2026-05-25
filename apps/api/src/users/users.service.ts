import { ConflictException, Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/createUser.dto';

const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

/** Select de UserCompany; en Prisma la relación se llama `memberships` (1:N). */
const membershipRelationSelect = {
  id: true,
  companyId: true,
  roleId: true,
  defaultBranchId: true,
  role: { select: { id: true, name: true } },
  company: { select: { id: true, name: true, slug: true } },
} as const;

export type UserMembership = {
  id: string;
  companyId: string;
  roleId: string;
  defaultBranchId: string | null;
  role: { id: string; name: string };
  company: { id: string; name: string; slug: string };
};

type UserWithMembershipsRow = {
  memberships: UserMembership[];
};

function withMembership<T extends UserWithMembershipsRow>(
  user: T,
): Omit<T, 'memberships'> & { membership: UserMembership | null } {
  const { memberships, ...rest } = user;
  return { ...rest, membership: memberships[0] ?? null };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  );
}

@Injectable()
export class UsersService {
  findAll() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: publicUserSelect,
    });
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...publicUserSelect,
        memberships: { select: membershipRelationSelect, take: 1 },
      },
    });
    return user ? withMembership(user) : null;
  }

  async findByIdForAccessToken(userId: string, companyId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...publicUserSelect,
        memberships: {
          where: { companyId },
          select: membershipRelationSelect,
          take: 1,
        },
      },
    });

    if (!user?.isActive) {
      return null;
    }

    return withMembership(user);
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: {
        ...publicUserSelect,
        passwordHash: true,
        memberships: { select: membershipRelationSelect, take: 1 },
      },
    });
    return user ? withMembership(user) : null;
  }

  async create(createUserDto: CreateUserDto) {
    const email = normalizeEmail(createUserDto.email);
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    try {
      return await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: createUserDto.firstName.trim(),
          lastName: createUserDto.lastName.trim(),
        },
        select: publicUserSelect,
      });
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Ese email ya está registrado');
      }
      throw error;
    }
  }

  updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      select: publicUserSelect,
    });
  }
}
