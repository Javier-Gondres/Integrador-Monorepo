import { ConflictException, Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class UsersService {
  findAll() {
    return prisma.user.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, name: true, email: true },
    });
  }

  async create(email: string, name: string | null) {
    try {
      return await prisma.user.create({
        data: { email, name },
        select: { id: true, name: true, email: true },
      });
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        (e as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Ese email ya está registrado');
      }
      throw e;
    }
  }
}
