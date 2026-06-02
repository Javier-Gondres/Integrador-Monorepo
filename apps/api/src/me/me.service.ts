import { Injectable } from '@nestjs/common';

import { AuthContext } from '../auth/auth.types';
import { BranchRepository } from '../branch/branch.repository';
import { AuthException, BusinessException, ErrorCodes } from '../common/errors';
import { CompanyRepository } from '../company/company.repository';
import { SwitchBranchDto } from './dto/switch-branch.dto';
import { SwitchCompanyDto } from './dto/switch-company.dto';
import { MeRepository } from './me.repository';

@Injectable()
export class MeService {
  constructor(
    private readonly meRepository: MeRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly branchRepository: BranchRepository,
  ) {}

  async getProfile(userId: string) {
    const user = await this.meRepository.findProfile(userId);
    if (!user) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'Usuario no encontrado',
      );
    }
    return user;
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

  findMyBranches(companyId: string) {
    return this.branchRepository.findManyByCompany(companyId);
  }

  async switchCompany(userId: string, dto: SwitchCompanyDto) {
    const membership = await this.meRepository.findMembership(
      userId,
      dto.companyId,
    );

    if (!membership) {
      throw AuthException.unauthorizedCompanyAccess(
        'No tienes acceso a esta empresa',
      );
    }

    if (!membership.company.isActive) {
      throw BusinessException.forbidden(
        ErrorCodes.RECORD_NOT_FOUND,
        'La empresa no está activa',
      );
    }

    return {
      message:
        'Empresa activa actualizada. El contexto se reflejará en la próxima solicitud autenticada.',
      company: membership.company,
      role: membership.role.name,
      defaultBranchId: membership.defaultBranchId,
    };
  }

  async switchBranch(auth: AuthContext, dto: SwitchBranchDto) {
    if (!auth.companyId) {
      throw AuthException.unauthorizedCompanyAccess();
    }

    const branch = await this.branchRepository.findByIdInCompany(
      dto.branchId,
      auth.companyId,
    );

    if (!branch) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La sucursal no existe en esta empresa',
      );
    }

    if (!branch.isActive) {
      throw BusinessException.forbidden(
        ErrorCodes.VALIDATION_ERROR,
        'La sucursal no está activa',
      );
    }

    await this.meRepository.updateDefaultBranch(
      auth.userId,
      auth.companyId,
      dto.branchId,
    );

    return {
      message: 'Sucursal activa actualizada',
      branchId: dto.branchId,
    };
  }
}
