import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@repo/db";

import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";

@Injectable()
export class BranchService {
  async create(createBranchDto: CreateBranchDto, companySlug: string) {
    const company = await prisma.company.findUnique({
      where: {
        slug: companySlug,
      },
    });

    if (!company) {
      throw new NotFoundException(`Empresa slug: ${companySlug} no encontrada`);
    }

    return await prisma.branch.create({
      data: {
        name: createBranchDto.name,
        address: createBranchDto.address,
        phone: createBranchDto.phone,
        companyId: company.id,
      },
    });
  }

  async findAll(slug: string) {
    return await prisma.branch.findMany({
      where: {
        company: {
          slug,
        },
      },
    });
  }

  async findOne(id: string) {
    const branch = await prisma.branch.findUnique({
      where: {
        id,
      },
    });

    if (!branch) {
      throw new NotFoundException(`Sucursal Id: ${id} no encontrado`);
    }

    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    const branch = await this.findOne(id);

    return await prisma.branch.update({
      where: {
        id: branch.id,
      },
      data: {
        name: updateBranchDto.name,
        address: updateBranchDto.address,
        phone: updateBranchDto.phone,
      },
    });
  }

  async remove(id: string) {
    const branch = await this.findOne(id);

    return await prisma.branch.update({
      where: { id: branch.id },
      data: {
        isActive: false,
      },
    });
  }
}
