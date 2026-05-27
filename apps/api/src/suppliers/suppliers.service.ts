import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class SuppliersService {
  async findAll() {
    return prisma.supplier.findMany({
      where: {
        deleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        company: true,
      },
    });
  }

  async findOne(id: string) {
    const supplier = await prisma.supplier.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        company: true,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async create(
    supplierId: string,
    name: string,
    email: string,
    rnc: string,
    phoneNumber: string,
    address: string,
    companyId: string,
  ) {
    const existingSupplier = await prisma.supplier.findFirst({
      where: {
        supplierId,
        deleted: false,
      },
    });

    if (existingSupplier) {
      throw new ConflictException('Supplier ID already exists');
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return prisma.supplier.create({
      data: {
        supplierId,
        name,
        email,
        rnc,
        phoneNumber,
        address,
        companyId,
      },
    });
  }

  async update(
    id: string,
    data: {
      supplierId?: string;
      name?: string;
      email?: string;
      rnc?: string;
      phoneNumber?: string;
      address?: string;
      companyId?: string;
    },
  ) {
    await this.findOne(id);

    if (data.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: data.companyId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    if (data.supplierId) {
      const existingSupplier = await prisma.supplier.findFirst({
        where: {
          supplierId: data.supplierId,
          id: {
            not: id,
          },
          deleted: false,
        },
      });

      if (existingSupplier) {
        throw new ConflictException('Supplier ID already exists');
      }
    }

    return prisma.supplier.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return prisma.supplier.update({
      where: {
        id,
      },
      data: {
        deleted: true,
      },
    });
  }
}
