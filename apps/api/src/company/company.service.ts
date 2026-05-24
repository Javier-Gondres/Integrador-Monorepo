import { Injectable, NotFoundException } from "@nestjs/common";
import type { Company } from "@repo/db";
import { prisma } from "@repo/db";

import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Injectable()
export class CompanyService {
  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    return await prisma.company.create({
      data: {
        name: createCompanyDto.name,
        rnc: createCompanyDto.rnc,
      },
    });
  }

  async findAll() {
    return await prisma.company.findMany();
  }

  async findOne(id: string) {
    const company = await prisma.company.findUnique({
      where: {
        id,
      },
    });

    if (!company) {
      throw new NotFoundException(`Empresa ID: ${id} no encontrada`);
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.findOne(id);

    return await prisma.company.update({
      select: { name: true, rnc: true },
      where: { id: company.id },
      data: {
        name: updateCompanyDto.name,
        rnc: updateCompanyDto.rnc,
      },
    });
  }

  async remove(id: string) {
    const company = await this.findOne(id);

    return await prisma.company.delete({
      where: { id: company.id },
    });
  }
}
