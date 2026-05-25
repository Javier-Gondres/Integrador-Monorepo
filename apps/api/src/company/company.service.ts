import { Injectable, NotFoundException } from "@nestjs/common";
import type { Company } from "@repo/db";
import { prisma } from "@repo/db";
import slug from "slug";

import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Injectable()
export class CompanyService {
  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    return await prisma.company.create({
      data: {
        name: createCompanyDto.name,
        rnc: createCompanyDto.rnc,
        slug: slug(createCompanyDto.name),
      },
    });
  }

  async findAll() {
    return await prisma.company.findMany({
      where: { isActive: true },
    });
  }

  async findOne(slug: string) {
    const company = await prisma.company.findUnique({
      where: {
        slug,
        isActive: true,
      },
    });

    if (!company) {
      throw new NotFoundException(`Empresa ID: ${slug} no encontrada`);
    }

    return company;
  }

  async update(slug: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.findOne(slug);

    return await prisma.company.update({
      select: { name: true, rnc: true },
      where: { slug: company.slug },
      data: {
        name: updateCompanyDto.name,
        rnc: updateCompanyDto.rnc,
      },
    });
  }

  async remove(slug: string) {
    const company = await this.findOne(slug);

    return await prisma.company.update({
      where: { slug: company.slug },
      data: { isActive: false },
    });
  }
}
