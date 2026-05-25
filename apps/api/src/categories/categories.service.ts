import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@repo/db';

interface PaginatedParams {
  page: number;
  take: number;
  q: string;
}

const categorySelect = {
  id: true,
  name: true,
  description: true,
  state: true,
  deleted: true,
} as const;

@Injectable()
export class CategoriesService {
  // Paginado + búsqueda
  async findPaginated({ page, take, q }: PaginatedParams) {
    const skip = (page - 1) * take;

    const where = {
      deleted: false,
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        select: categorySelect,
      }),
      prisma.category.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / take) || 1,
    };
  }

  // Buscar todos
  findAll() {
    return prisma.category.findMany({
      where: { deleted: false },
      orderBy: { id: 'asc' },
      select: categorySelect,
    });
  }

  // Buscar uno
  async findOne(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      select: categorySelect,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // Crear
  async create(name: string, description?: string) {
    try {
      return await prisma.category.create({
        data: { name, description },
        select: categorySelect,
      });
    } catch (e: unknown) {
      if (isPrismaError(e, 'P2002')) {
        throw new ConflictException('Category already exists');
      }
      throw e;
    }
  }

  // Actualizar
  async update(id: number, data: { name?: string; description?: string }) {
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    try {
      return await prisma.category.update({
        where: { id },
        data,
        select: categorySelect,
      });
    } catch (e: unknown) {
      if (isPrismaError(e, 'P2002')) {
        throw new ConflictException('Category name already exists');
      }
      throw e;
    }
  }

  // Cambiar estado (activo / inactivo)
  async changeState(id: number, state: boolean) {
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return prisma.category.update({
      where: { id },
      data: { state },
      select: categorySelect,
    });
  }

  // Borrado lógico
  async softDelete(id: number) {
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.deleted) {
      throw new ConflictException('Category is already deleted');
    }

    return prisma.category.update({
      where: { id },
      data: { deleted: true },
      select: categorySelect,
    });
  }
}

//Helper reutilizable para errores
function isPrismaError(e: unknown, code: string): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: string }).code === code
  );
}
