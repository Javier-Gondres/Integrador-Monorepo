import { Injectable } from '@nestjs/common';
import slugify from 'slug';
import { getDefinedData } from 'src/common/helpers/object.utils';

import { AuthService } from '../auth/auth.service';
import { AuthContext } from '../auth/auth.types';
import {
  assertCanManageCompany,
  assertCompanyAccessOrPlatformAdmin,
} from '../common/company';
import { BusinessException, ErrorCodes } from '../common/errors';
import { assertSuperAdminCannotJoinTenant } from '../common/platform';
import { CompanyRepository } from './company.repository';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

const DEFAULT_BRANCH_NAME = 'Sucursal principal';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly authService: AuthService,
  ) {}

  async createOnboarding(auth: AuthContext, dto: CreateCompanyDto) {
    assertSuperAdminCannotJoinTenant(auth);

    const hasMembership = await this.companyRepository.hasActiveMembership(
      auth.userId,
    );
    if (hasMembership) {
      throw BusinessException.conflict(
        ErrorCodes.DUPLICATE_RECORD,
        'Ya perteneces a una empresa. No puedes crear otra desde esta cuenta.',
      );
    }

    const companySlug = slugify(dto.name.trim());
    const rnc = dto.rnc?.trim() || null;

    const duplicate = await this.companyRepository.findDuplicateBySlugOrRnc(
      companySlug,
      rnc,
    );
    if (duplicate) {
      throw BusinessException.conflict(
        ErrorCodes.DUPLICATE_RECORD,
        'Ya existe una empresa con el mismo nombre o RNC',
      );
    }

    const company = await this.companyRepository.createWithOnboarding({
      userId: auth.userId,
      name: dto.name.trim(),
      slug: companySlug,
      rnc,
      defaultBranchName: DEFAULT_BRANCH_NAME,
    });

    const accessToken = await this.authService.issueAccessToken(auth.userId);

    return { company, accessToken };
  }

  async findMyCompanies(userId: string) {
    const rows = await this.companyRepository.findMyCompaniesForUser(userId);

    return rows.map((row) => ({
      id: row.company.id,
      name: row.company.name,
      slug: row.company.slug,
      isActive: row.company.isActive,
      role: row.role.name,
      defaultBranchId: row.defaultBranchId,
    }));
  }

  async findByIdForUser(id: string, auth: AuthContext) {
    assertCompanyAccessOrPlatformAdmin(id, auth);

    const company = await this.companyRepository.findByIdWithBranches(id);
    if (!company) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La empresa no existe',
      );
    }

    return company;
  }

  async update(id: string, auth: AuthContext, dto: UpdateCompanyDto) {
    assertCanManageCompany(auth);
    await this.findByIdForUser(id, auth);

    const updateData = getDefinedData(dto);

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim();
    }
    if (dto.rnc !== undefined) {
      updateData.rnc = dto.rnc?.trim();
    }
    if (dto.email !== undefined) {
      updateData.email = dto.email?.trim();
    }
    if (dto.phone !== undefined) {
      updateData.phone = dto.phone?.trim();
    }

    if (Object.keys(updateData).length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    if (updateData.rnc) {
      const duplicateRnc = await this.companyRepository.findDuplicateRnc(
        updateData.rnc,
        id,
      );
      if (duplicateRnc) {
        throw BusinessException.conflict(
          ErrorCodes.DUPLICATE_RECORD,
          'Ya existe una empresa con ese RNC',
        );
      }
    }

    return this.companyRepository.update(id, updateData);
  }

  async activate(id: string, auth: AuthContext) {
    assertCanManageCompany(auth);
    const company = await this.findByIdForUser(id, auth);

    if (company.isActive) {
      return company;
    }

    await this.companyRepository.activate(id);

    company.isActive = true;
    return company;
  }

  async deactivate(id: string, auth: AuthContext) {
    assertCanManageCompany(auth);
    const company = await this.findByIdForUser(id, auth);
    if (!company.isActive) {
      return company;
    }
    await this.companyRepository.deactivate(id);
    company.isActive = false;
    return company;
  }

  async remove(id: string, auth: AuthContext) {
    assertCanManageCompany(auth);
    await this.findByIdForUser(id, auth);
    await this.companyRepository.softDelete(id);

    return {
      message: 'Empresa eliminada correctamente',
    };
  }
}
