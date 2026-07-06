import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import slugify from 'slug';

import { BusinessException, ErrorCodes } from '../common/errors';
import { CreatePlatformCompanyDto } from './dto/create-platform-company.dto';
import {
  NormalizedQueryPlatformCompanies,
  QueryPlatformCompaniesDto,
} from './dto/query-platform-companies.dto';
import { PlatformRepository } from './platform.repository';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;
const DEFAULT_BRANCH_NAME = 'Sucursal principal';

@Injectable()
export class PlatformService {
  constructor(private readonly platformRepository: PlatformRepository) {}

  getOverview() {
    return this.platformRepository.findOverview();
  }

  async findAllCompanies(query: QueryPlatformCompaniesDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.platformRepository.findPaginated(normalized);

    return {
      items: items.map((row) => this.mapCompanyListItem(row)),
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async findCompanyById(id: string) {
    const company = await this.platformRepository.findById(id);
    if (!company) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La empresa no existe',
      );
    }

    return company;
  }

  async createCompany(dto: CreatePlatformCompanyDto) {
    const name = dto.name.trim();
    const slug = slugify(name);
    const rnc = dto.rnc?.trim() || null;
    const email = dto.owner.email.trim().toLowerCase();

    const duplicateCompany =
      await this.platformRepository.findDuplicateBySlugOrRnc(slug, rnc);
    if (duplicateCompany) {
      throw BusinessException.conflict(
        ErrorCodes.DUPLICATE_RECORD,
        'Ya existe una empresa con el mismo nombre o RNC',
      );
    }

    const existingUser = await this.platformRepository.findUserByEmail(email);
    if (existingUser) {
      throw BusinessException.conflict(
        ErrorCodes.DUPLICATE_RECORD,
        'Ya existe un usuario con ese email',
      );
    }

    const passwordHash = await bcrypt.hash(dto.owner.password, 10);

    const result = await this.platformRepository.createCompanyWithOwner({
      name,
      slug,
      rnc,
      defaultBranchName: DEFAULT_BRANCH_NAME,
      owner: {
        email,
        passwordHash,
        firstName: dto.owner.firstName.trim(),
        lastName: dto.owner.lastName.trim(),
      },
    });

    if (result.status !== 'ok') {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El rol OWNER no está configurado',
      );
    }

    return result.company;
  }

  async activateCompany(id: string) {
    const company = await this.findCompanyById(id);
    if (company.isActive) {
      return company;
    }

    await this.platformRepository.activate(id);
    company.isActive = true;
    return company;
  }

  async deactivateCompany(id: string) {
    const company = await this.findCompanyById(id);
    if (!company.isActive) {
      return company;
    }

    await this.platformRepository.deactivate(id);
    company.isActive = false;
    return company;
  }

  private mapCompanyListItem(
    row: Awaited<
      ReturnType<PlatformRepository['findPaginated']>
    >['items'][number],
  ) {
    const ownerMembership = row.users[0];

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      rnc: row.rnc,
      isActive: row.isActive,
      createdAt: row.createdAt,
      owner: ownerMembership?.user
        ? {
            email: ownerMembership.user.email,
            firstName: ownerMembership.user.firstName,
            lastName: ownerMembership.user.lastName,
          }
        : null,
    };
  }

  private normalizeQuery(
    query: QueryPlatformCompaniesDto,
  ): NormalizedQueryPlatformCompanies {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };
  }
}
