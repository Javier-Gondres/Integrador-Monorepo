import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';
import { prisma } from '@repo/db';
import type { Enterprise } from '@repo/db';

@Injectable()
export class EnterpriseService {
  async create(createEnterpriseDto: CreateEnterpriseDto): Promise<Enterprise> {
    return await prisma.enterprise.create({
      data: {
        name: createEnterpriseDto.name,
        rnc: createEnterpriseDto.rnc,
      },
    });
  }

  async findAll() {
    return await prisma.enterprise.findMany();
  }

  async findOne(id: string) {
    const enterprise = await prisma.enterprise.findUnique({
      where: {
        id,
      },
    });

    if (!enterprise) {
      throw new NotFoundException(`Empresa ID: ${id} no encontrada`);
    }

    return enterprise;
  }

  async update(id: string, updateEnterpriseDto: UpdateEnterpriseDto) {
    const enterprise = await this.findOne(id);

    return await prisma.enterprise.update({
      select: { name: true, rnc: true },
      where: { id: enterprise.id },
      data: {
        name: updateEnterpriseDto.name,
        rnc: updateEnterpriseDto.rnc,
      },
    });
  }

  async remove(id: string) {
    const enterprise = await this.findOne(id);

    return await prisma.enterprise.delete({
      where: { id: enterprise.id },
    });
  }
}
