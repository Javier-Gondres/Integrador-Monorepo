import { Injectable } from '@nestjs/common';
import type { RoleName } from '@repo/db';
import { prisma } from '@repo/db';
import * as bcrypt from 'bcrypt';

import { UserAuthContext } from '../auth/auth.types';
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

const membershipRelationSelect = {
  companyId: true,
  defaultBranchId: true,
  role: { select: { name: true } },
} as const;

const membershipRelationSelectFull = {
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
  role: { id: string; name: RoleName };
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

@Injectable()
export class UsersService {
  async findAuthContext(userId: string): Promise<UserAuthContext | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        memberships: {
          select: membershipRelationSelect,
          take: 1,
        },
      },
    });

    if (!user) {
      return null;
    }

    const membership = user.memberships[0] ?? null;

    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      membership: membership
        ? {
            companyId: membership.companyId,
            defaultBranchId: membership.defaultBranchId,
            role: { name: membership.role.name },
          }
        : null,
    };
  }

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
        memberships: { select: membershipRelationSelectFull, take: 1 },
      },
    });
    return user ? withMembership(user) : null;
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: {
        ...publicUserSelect,
        passwordHash: true,
        memberships: { select: membershipRelationSelectFull, take: 1 },
      },
    });
    return user ? withMembership(user) : null;
  }

  async create(createUserDto: CreateUserDto) {
    const email = normalizeEmail(createUserDto.email);
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    // P2002 (email duplicado) lo traduce GlobalExceptionFilter → 409 EMAIL_ALREADY_EXISTS
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: createUserDto.firstName.trim(),
        lastName: createUserDto.lastName.trim(),
      },
      select: publicUserSelect,
    });
  }

  updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      select: publicUserSelect,
    });
  }
}
