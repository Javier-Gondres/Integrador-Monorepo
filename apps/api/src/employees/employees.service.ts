import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class EmployeesService {
  async findAll() {
    return prisma.employee.findMany({
      where: {
        deleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        branch: true,
      },
    });
  }

  async findOne(id: string) {
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        branch: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async create(
    employeeId: string,
    name: string,
    position: string,
    phoneNumber: string,
    branchId: string,
  ) {
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        employeeId,
        deleted: false,
      },
    });

    if (existingEmployee) {
      throw new ConflictException('Employee ID already exists');
    }

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return prisma.employee.create({
      data: {
        employeeId,
        name,
        position,
        phoneNumber,
        deleted: false,
        branchId,
      },
    });
  }

  async update(
    id: string,
    data: {
      employeeId?: string;
      name?: string;
      position?: string;
      phoneNumber?: string;
      branchId?: string;
    },
  ) {
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        deleted: false,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return prisma.employee.update({
      where: {
        id,
      },
      data: {
        ...(data.employeeId && {
          employeeId: data.employeeId,
        }),

        ...(data.name && {
          name: data.name,
        }),

        ...(data.position && {
          position: data.position,
        }),

        ...(data.phoneNumber && {
          phoneNumber: data.phoneNumber,
        }),

        ...(data.branchId && {
          branchId: data.branchId,
        }),
      },
    });
  }

  async remove(id: string) {
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        deleted: false,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return prisma.employee.update({
      where: {
        id,
      },
      data: {
        deleted: true,
      },
    });
  }

  async restore(id: string) {
    const employee = await prisma.employee.findUnique({
      where: {
        id,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return prisma.employee.update({
      where: {
        id,
      },
      data: {
        deleted: false,
      },
    });
  }
}
