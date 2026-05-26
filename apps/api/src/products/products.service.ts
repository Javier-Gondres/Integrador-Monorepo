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

interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  companyId?: string | null;
  state?: boolean;
}

interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  companyId?: string | null;
  state?: boolean;
}

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  companyId: true,
  state: true,
  deleted: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class ProductsService {
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
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        select: productSelect,
      }),
      prisma.product.count({ where }),
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
    return prisma.product.findMany({
      where: { deleted: false },
      orderBy: { name: 'asc' },
      select: productSelect,
    });
  }

  // Buscar uno
  async findOne(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      select: productSelect,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Crear
  async create(data: CreateProductInput) {
    try {
      const createData: any = {
        name: data.name.trim(),
        description: data.description,
        price: data.price,
        state: data.state ?? true,
      };

      if (data.companyId !== undefined) {
        createData.companyId = data.companyId === null ? null : data.companyId.trim();
      }

      return await prisma.product.create({
        data: createData,
        select: productSelect,
      });
    } catch (e: unknown) {
      if (isPrismaError(e, 'P2002')) {
        throw new ConflictException('Product already exists');
      }
      throw e;
    }
  }

  // Actualizar
  async update(id: string, data: UpdateProductInput) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name.trim();
      if (data.description !== undefined) updateData.description = data.description;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.companyId !== undefined)
        updateData.companyId = data.companyId === null ? null : data.companyId.trim();
      if (data.state !== undefined) updateData.state = data.state;

      return await prisma.product.update({
        where: { id },
        data: updateData,
        select: productSelect,
      });
    } catch (e: unknown) {
      if (isPrismaError(e, 'P2002')) {
        throw new ConflictException('Product name already exists');
      }
      throw e;
    }
  }

  // Cambiar estado (activo / inactivo)
  async changeState(id: string, state: boolean) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return prisma.product.update({
      where: { id },
      data: { state },
      select: productSelect,
    });
  }

  // Borrado lógico
  async softDelete(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.deleted) {
      throw new ConflictException('Product is already deleted');
    }

    return prisma.product.update({
      where: { id },
      data: { deleted: true, state: false },
      select: productSelect,
    });
  }
}

// Helper reutilizable para errores
function isPrismaError(e: unknown, code: string): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: string }).code === code
  );
}