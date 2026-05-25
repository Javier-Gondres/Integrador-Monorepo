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

const membershipsSelect = {
  memberships: {
    select: {
      id: true,
      companyId: true,
      roleId: true,
      defaultBranchId: true,
      role: { select: { id: true, name: true } },
      company: { select: { id: true, name: true, slug: true } },
    },
  },
} as const;

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

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        ...publicUserSelect,
        memberships: {
          select: {
            id: true,
            companyId: true,
            roleId: true,
            defaultBranchId: true,
            role: { select: { id: true, name: true, description: true } },
            company: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: {
        ...publicUserSelect,
        passwordHash: true,
        ...membershipsSelect,
      },
    });
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
