import { Injectable } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { AuthContext } from '../auth/auth.types';
import {
  type BranchRecord,
  BranchRepository,
} from '../branch/branch.repository';
import { BranchAccessService } from '../branch/branch-access.service';
import { AuthException, BusinessException, ErrorCodes } from '../common/errors';
import { CompanyRepository } from '../company/company.repository';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { UpdateMeDto } from '../users/dto/update-me.dto';
import { UsersService } from '../users/users.service';
import { SwitchBranchDto } from './dto/switch-branch.dto';
import { MeRepository } from './me.repository';
import type { MyCompanyMembership } from './me.types';

@Injectable()
export class MeService {
  constructor(
    private readonly meRepository: MeRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly branchRepository: BranchRepository,
    private readonly branchAccessService: BranchAccessService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  getProfile(userId: string, companyId: string) {
    return this.usersService.findByIdInCompany(userId, companyId);
  }

  updateProfile(userId: string, companyId: string, dto: UpdateMeDto) {
    return this.usersService.updateMe(userId, companyId, dto);
  }

  changePassword(userId: string, dto: ChangePasswordDto) {
    return this.usersService.changePassword(userId, dto);
  }

  async findMyCompany(userId: string): Promise<MyCompanyMembership> {
    const membership =
      await this.companyRepository.findMyCompanyForUser(userId);

    if (!membership) {
      throw AuthException.unauthorizedCompanyAccess(
        'No tienes una empresa asignada',
      );
    }

    return this.toMyCompanyMembership(membership);
  }

  private toMyCompanyMembership(membership: {
    defaultBranchId: string | null;
    role: { name: MyCompanyMembership['role'] };
    company: {
      id: string;
      name: string;
      slug: string;
      isActive: boolean;
    };
  }): MyCompanyMembership {
    return {
      id: membership.company.id,
      name: membership.company.name,
      slug: membership.company.slug,
      isActive: membership.company.isActive,
      role: membership.role.name,
      defaultBranchId: membership.defaultBranchId,
    };
  }

  async findMyBranch(auth: AuthContext): Promise<BranchRecord> {
    if (!auth.companyId) {
      throw AuthException.unauthorizedCompanyAccess();
    }

    let branchId = auth.branchId;

    if (!branchId) {
      const membership = await this.companyRepository.findMyCompanyForUser(
        auth.userId,
      );
      branchId = membership?.defaultBranchId ?? null;
    }

    if (!branchId) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'No tienes una sucursal activa asignada',
      );
    }

    const branch = await this.branchRepository.findByIdInCompany(
      branchId,
      auth.companyId,
    );

    if (!branch) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La sucursal activa no existe en esta empresa',
      );
    }

    return branch;
  }

  async switchBranch(auth: AuthContext, dto: SwitchBranchDto) {
    if (!auth.companyId) {
      throw AuthException.unauthorizedCompanyAccess();
    }

    await this.branchAccessService.assertBranchInCompany(
      dto.branchId,
      auth.companyId,
    );

    await this.meRepository.updateDefaultBranch(
      auth.userId,
      auth.companyId,
      dto.branchId,
    );

    const accessToken = await this.authService.issueAccessToken(auth.userId);

    return {
      message: 'Sucursal activa actualizada',
      branchId: dto.branchId,
      accessToken,
    };
  }
}
