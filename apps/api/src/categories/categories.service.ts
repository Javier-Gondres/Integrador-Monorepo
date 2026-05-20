import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class CategoriesService {
  findAll() {
    return prisma.category.findMany({
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        state: true,
      },
    });
  }

  async findOne(id: number) {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        state: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(name: string, description?: string) {
    try {
      return await prisma.category.create({
        data: { name, description },
        select: { id: true, name: true, description: true, state: true },
      });
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        (e as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Category already exists');
      }

      throw e;
    }
  }

  async changeState(id: number, state: boolean) {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return prisma.category.update({
      where: {
        id,
      },
      data: {
        state,
      },
      select: {
        id: true,
        name: true,
        description: true,
        state: true,
      },
    });
  }
}
