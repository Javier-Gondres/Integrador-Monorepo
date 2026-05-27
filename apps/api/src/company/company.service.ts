import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Company } from "@repo/db";
import { prisma } from "@repo/db";
import slug from "slug";

import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Injectable()
export class CompanyService {
  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const companySlug = slug(createCompanyDto.name);

    const validateUnique = await prisma.company.findFirst({
      where: {
        OR: [
          { slug: { equals: companySlug } },
          { rnc: { equals: createCompanyDto.rnc } },
        ],
      },
    });

    if (validateUnique) {
      throw new BadRequestException(
        "Ya existe una compania con el nombre o rnc ingresado",
      );
    }

    return await prisma.company.create({
      data: {
        name: createCompanyDto.name,
        rnc: createCompanyDto.rnc,
        slug: companySlug,
        branches: {
          create: {
            name: "Sucursal",
          },
        },
      },
    });
  }

  async findAll() {
    return await prisma.company.findMany({
      include: { branches: true },
    });
  }

  async findOne(slug: string) {
    const company = await prisma.company.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        branches: true,
      },
    });

    if (!company) {
      throw new NotFoundException(`Empresa ID: ${slug} no encontrada`);
    }

    return company;
  }

  async update(slug: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.findOne(slug);
    let validateUnique = undefined;
    if (
      !(
        updateCompanyDto.rnc === undefined ||
        updateCompanyDto.rnc === company.rnc
      )
    ) {
      validateUnique = await prisma.company.findFirst({
        where: {
          AND: [
            {
              rnc: {
                equals: updateCompanyDto.rnc,
                not: company.slug,
              },
            },
          ],
        },
      });
    }

    if (validateUnique) {
      throw new BadRequestException(
        `Ya existe una empresa con el rnc: ${updateCompanyDto.rnc}`,
      );
    }

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
