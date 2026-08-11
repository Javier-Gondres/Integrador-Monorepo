import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PasswordResetTokenPurpose, RoleName } from '@repo/db';
import {
  ALL_PERMISSIONS,
  ROLE_PERMISSION_MATRIX,
  TenantRole,
} from '@repo/shared';
import * as bcrypt from 'bcrypt';
import slugify from 'slug';

import { AuthService } from '../auth/auth.service';
import { AuthContext } from '../auth/auth.types';
import { BusinessException, ErrorCodes } from '../common/errors';
import { EmailService } from '../email/email.service';
import { InvitationsService } from '../invitations/invitations.service';
import { AssignPlatformUserCompanyDto } from './dto/assign-platform-user-company.dto';
import { CreatePlatformCompanyDto } from './dto/create-platform-company.dto';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import {
  NormalizedQueryPlatformActivations,
  QueryPlatformActivationsDto,
} from './dto/query-platform-activations.dto';
import {
  NormalizedQueryPlatformCompanies,
  QueryPlatformCompaniesDto,
} from './dto/query-platform-companies.dto';
import {
  NormalizedQueryPlatformInvitations,
  QueryPlatformInvitationsDto,
} from './dto/query-platform-invitations.dto';
import {
  NormalizedQueryPlatformUsers,
  QueryPlatformUsersDto,
} from './dto/query-platform-users.dto';
import { TransferCompanyOwnershipDto } from './dto/transfer-company-ownership.dto';
import { UpdatePlatformCompanyDto } from './dto/update-platform-company.dto';
import { UpdatePlatformUserDto } from './dto/update-platform-user.dto';
import { UpdatePlatformUserRoleDto } from './dto/update-platform-user-role.dto';
import {
  PlatformUserStatus,
  UpdatePlatformUserStatusDto,
} from './dto/update-platform-user-status.dto';
import { PlatformRepository } from './platform.repository';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;
const DEFAULT_BRANCH_NAME = 'Sucursal principal';

@Injectable()
export class PlatformService {
  constructor(
    private readonly platformRepository: PlatformRepository,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    private readonly invitationsService: InvitationsService,
  ) {}

  getOverview() {
    return this.platformRepository.findOverview();
  }

  getPermissionsCatalog() {
    const permissionsByCode = new Map(
      ALL_PERMISSIONS.map((permission) => [permission.code, permission]),
    );

    return {
      permissions: ALL_PERMISSIONS.map((permission) => ({
        code: permission.code,
        name: this.humanizePermission(permission.code),
        description: permission.description,
      })),
      roles: Object.values(TenantRole).map((role) => ({
        role,
        permissions: (ROLE_PERMISSION_MATRIX[role] ?? []).map((code) => {
          const permission = permissionsByCode.get(code);
          return {
            code,
            name: this.humanizePermission(code),
            description: permission?.description ?? null,
          };
        }),
      })),
    };
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

  async findAllUsers(query: QueryPlatformUsersDto) {
    const normalized = this.normalizeUsersQuery(query);
    const { items, total } =
      await this.platformRepository.findUsersPaginated(normalized);

    return {
      items: items.map((row) => ({
        ...this.mapPlatformUser(row),
      })),
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async findAllActivations(query: QueryPlatformActivationsDto) {
    const normalized = this.normalizeActivationsQuery(query);
    const { items, total } =
      await this.platformRepository.findActivationsPaginated(normalized);

    return {
      items: items.map((row) => this.mapActivation(row)),
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  findAllInvitations(query: QueryPlatformInvitationsDto) {
    return this.invitationsService.findAllForPlatform(
      this.normalizeInvitationsQuery(query),
    );
  }

  async createUser(dto: CreatePlatformUserDto, actor: AuthContext) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.platformRepository.findUserByEmail(email);
    if (existingUser) {
      throw BusinessException.conflict(
        ErrorCodes.EMAIL_ALREADY_EXISTS,
        'Ya existe un usuario con ese email',
      );
    }

    const temporaryPasswordHash = await bcrypt.hash(randomUUID(), 10);
    const user = await this.platformRepository.createPlatformUser({
      email,
      passwordHash: temporaryPasswordHash,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      actorId: actor.userId,
    });

    await this.sendPasswordSetupEmail(
      user.id,
      PasswordResetTokenPurpose.PLATFORM_ACTIVATION,
    );

    return user;
  }

  async findUserById(id: string) {
    const user = await this.assertPlatformUserExists(id);
    return this.mapPlatformUserDetail(user);
  }

  async updateUser(id: string, dto: UpdatePlatformUserDto, actor: AuthContext) {
    await this.assertPlatformUserExists(id);
    const user = await this.platformRepository.updatePlatformUser(id, {
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      actorId: actor.userId,
    });
    return this.mapPlatformUser(user);
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

  async updateCompany(
    id: string,
    dto: UpdatePlatformCompanyDto,
    actor: AuthContext,
  ) {
    await this.findCompanyById(id);

    const updateData: { name?: string; rnc?: string | null } = {};

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (!name) {
        throw new BusinessException(
          ErrorCodes.VALIDATION_ERROR,
          'El nombre de la empresa no puede estar vacío',
        );
      }
      updateData.name = name;
    }

    if (dto.rnc !== undefined) {
      updateData.rnc = dto.rnc?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    if (updateData.rnc) {
      const duplicateRnc = await this.platformRepository.findDuplicateRnc(
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

    return this.platformRepository.updateCompany(id, updateData, actor.userId);
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

  async updateUserStatus(
    id: string,
    dto: UpdatePlatformUserStatusDto,
    actor: AuthContext,
  ) {
    const user = await this.assertPlatformUserExists(id);
    if (user.isSuperAdmin && dto.status === PlatformUserStatus.BLOCKED) {
      throw BusinessException.forbidden(
        ErrorCodes.UNAUTHORIZED,
        'No se puede bloquear un SuperAdmin desde esta acción',
      );
    }

    const updated = await this.platformRepository.setUserActive(
      id,
      dto.status === PlatformUserStatus.ACTIVE,
      actor.userId,
    );
    return this.mapPlatformUser(updated);
  }

  async sendUserPasswordReset(id: string) {
    const user = await this.assertPlatformUserExists(id);
    await this.sendPasswordSetupEmail(user.id);
    return { message: 'Correo de restablecimiento enviado' };
  }

  async forceLogoutUser(id: string, actor: AuthContext) {
    await this.assertPlatformUserExists(id);
    const result = await this.platformRepository.forceLogoutUser({
      userId: id,
      actorId: actor.userId,
    });
    return {
      message: 'Sesiones invalidadas correctamente',
      revokedTokens: result.count,
    };
  }

  async resendActivation(id: string, actor: AuthContext) {
    const activation = await this.platformRepository.findActivationById(id);
    if (!activation) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La activación no existe',
      );
    }
    if (activation.usedAt) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'La activación ya fue utilizada',
      );
    }

    await this.platformRepository.revokePendingActivationsForUser(
      activation.user.id,
    );
    await this.sendPasswordSetupEmail(
      activation.user.id,
      PasswordResetTokenPurpose.PLATFORM_ACTIVATION,
    );
    await this.platformRepository.auditActivationResent({
      actorId: actor.userId,
      activationId: activation.id,
      userId: activation.user.id,
      email: activation.user.email,
    });

    return { message: 'Correo de activación reenviado' };
  }

  async cancelActivation(id: string, actor: AuthContext) {
    const result = await this.platformRepository.cancelActivation(
      id,
      actor.userId,
    );

    switch (result.status) {
      case 'ok':
        return this.mapActivation(result.activation);
      case 'already_used':
        throw new BusinessException(
          ErrorCodes.VALIDATION_ERROR,
          'La activación ya fue utilizada',
        );
      case 'already_cancelled':
        throw new BusinessException(
          ErrorCodes.VALIDATION_ERROR,
          'La activación ya fue cancelada',
        );
      case 'not_found':
        throw BusinessException.notFound(
          ErrorCodes.RECORD_NOT_FOUND,
          'La activación no existe',
        );
    }
  }

  resendInvitation(id: string, actor: AuthContext) {
    return this.invitationsService.resendForPlatform(id, actor);
  }

  revokeInvitation(id: string, actor: AuthContext) {
    return this.invitationsService.revokeForPlatform(id, actor);
  }

  async softDeleteUser(id: string, actor: AuthContext) {
    const user = await this.assertPlatformUserExists(id);
    if (user.isSuperAdmin) {
      throw BusinessException.forbidden(
        ErrorCodes.UNAUTHORIZED,
        'No se puede eliminar un SuperAdmin desde esta acción',
      );
    }

    const membership = user.memberships[0];
    if (membership?.role.name === RoleName.OWNER) {
      throw BusinessException.conflict(
        ErrorCodes.VALIDATION_ERROR,
        'No se puede eliminar al OWNER. Primero transfiere la propiedad a otro usuario.',
      );
    }

    const deleted = await this.platformRepository.softDeleteUser({
      userId: id,
      actorId: actor.userId,
    });
    return this.mapPlatformUser(deleted);
  }

  async restoreUser(id: string, actor: AuthContext) {
    const user = await this.assertPlatformUserExists(id);
    if (!user.deletedAt) {
      return this.mapPlatformUser(user);
    }

    const duplicate = await this.platformRepository.findUserByEmail(user.email);
    if (duplicate && duplicate.id !== id) {
      throw BusinessException.conflict(
        ErrorCodes.EMAIL_ALREADY_EXISTS,
        'No se puede restaurar porque ya existe otro usuario activo con ese email',
      );
    }

    const restored = await this.platformRepository.restoreUser({
      userId: id,
      actorId: actor.userId,
    });
    return this.mapPlatformUser(restored);
  }

  async assignUserToCompany(
    id: string,
    dto: AssignPlatformUserCompanyDto,
    actor: AuthContext,
  ) {
    await this.assertPlatformUserExists(id);
    const result = await this.platformRepository.assignUserToCompany({
      userId: id,
      companyId: dto.companyId,
      roleName: dto.role,
      defaultBranchId: dto.defaultBranchId,
      actorId: actor.userId,
    });

    switch (result.status) {
      case 'ok':
        return { message: 'Usuario agregado a la empresa correctamente' };
      case 'user_has_membership':
        throw BusinessException.conflict(
          ErrorCodes.DUPLICATE_RECORD,
          'El usuario ya pertenece a una empresa',
        );
      case 'super_admin_cannot_join_tenant':
        throw BusinessException.forbidden(
          ErrorCodes.UNAUTHORIZED,
          'Un SuperAdmin no puede pertenecer a una empresa tenant',
        );
      case 'company_not_found':
        throw BusinessException.notFound(
          ErrorCodes.RECORD_NOT_FOUND,
          'La empresa no existe o no está activa',
        );
      case 'branch_not_found':
        throw BusinessException.notFound(
          ErrorCodes.RECORD_NOT_FOUND,
          'La sucursal no existe o no está activa',
        );
      case 'role_not_found':
        throw BusinessException.notFound(
          ErrorCodes.RECORD_NOT_FOUND,
          'El rol no existe',
        );
      case 'owner_not_found':
        throw BusinessException.conflict(
          ErrorCodes.VALIDATION_ERROR,
          'La empresa no tiene OWNER actual para transferir la propiedad',
        );
      case 'user_not_found':
        throw BusinessException.notFound(
          ErrorCodes.RECORD_NOT_FOUND,
          'El usuario no existe',
        );
    }
  }

  async removeUserMembership(id: string, actor: AuthContext) {
    const user = await this.assertPlatformUserExists(id);
    const membership = user.memberships[0];
    if (!membership) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El usuario no pertenece a una empresa',
      );
    }

    if (membership.role.name === RoleName.OWNER) {
      throw BusinessException.conflict(
        ErrorCodes.VALIDATION_ERROR,
        'No se puede sacar al OWNER de la empresa. Primero transfiere la propiedad a otro usuario.',
      );
    }

    const result = await this.platformRepository.removeUserMembership({
      userId: id,
      actorId: actor.userId,
    });
    if (result.status === 'membership_not_found') {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El usuario no pertenece a una empresa',
      );
    }

    return { message: 'Usuario removido de la empresa correctamente' };
  }

  async updateUserMembershipRole(
    id: string,
    dto: UpdatePlatformUserRoleDto,
    actor: AuthContext,
  ) {
    const result = await this.platformRepository.updateUserMembershipRole({
      userId: id,
      roleName: dto.role,
      actorId: actor.userId,
    });

    switch (result.status) {
      case 'ok':
        return { message: 'Rol actualizado correctamente' };
      case 'owner_requires_transfer':
        throw BusinessException.conflict(
          ErrorCodes.VALIDATION_ERROR,
          'El rol OWNER solo puede cambiarse mediante transferencia de propiedad',
        );
      case 'membership_not_found':
        throw BusinessException.notFound(
          ErrorCodes.RECORD_NOT_FOUND,
          'El usuario no pertenece a una empresa',
        );
      case 'role_not_found':
        throw BusinessException.notFound(
          ErrorCodes.RECORD_NOT_FOUND,
          'El rol no existe',
        );
    }
  }

  async transferCompanyOwnership(
    companyId: string,
    dto: TransferCompanyOwnershipDto,
    actor: AuthContext,
  ) {
    const result = await this.platformRepository.transferCompanyOwnership({
      companyId,
      newOwnerUserId: dto.newOwnerUserId,
      actorId: actor.userId,
    });

    switch (result.status) {
      case 'ok':
        return { message: 'Propiedad transferida correctamente' };
      case 'target_not_member':
        throw BusinessException.notFound(
          ErrorCodes.RECORD_NOT_FOUND,
          'El nuevo OWNER debe pertenecer a la empresa',
        );
      case 'super_admin_cannot_join_tenant':
        throw BusinessException.forbidden(
          ErrorCodes.UNAUTHORIZED,
          'Un SuperAdmin no puede ser OWNER de una empresa tenant',
        );
      case 'owner_not_found':
        throw BusinessException.conflict(
          ErrorCodes.VALIDATION_ERROR,
          'La empresa no tiene OWNER actual para transferir la propiedad',
        );
      case 'role_not_found':
        throw BusinessException.notFound(
          ErrorCodes.RECORD_NOT_FOUND,
          'Los roles OWNER/ADMIN no están configurados',
        );
    }
  }

  async verifyUserEmail(id: string) {
    await this.assertPlatformUserExists(id);
    return this.platformRepository.verifyUserEmail(id);
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

  private mapPlatformUser(
    row: Awaited<
      ReturnType<PlatformRepository['findUsersPaginated']>
    >['items'][number],
  ) {
    const membership = row.memberships[0] ?? null;
    return {
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      fullName: `${row.firstName} ${row.lastName}`.trim(),
      type: row.isSuperAdmin ? 'SUPER_ADMIN' : 'USER',
      status: row.deletedAt ? 'DELETED' : row.isActive ? 'ACTIVE' : 'BLOCKED',
      isActive: row.isActive,
      isSuperAdmin: row.isSuperAdmin,
      deletedAt: row.deletedAt,
      emailVerifiedAt: row.emailVerifiedAt,
      lastLoginAt: row.lastLoginAt,
      createdAt: row.createdAt,
      company: membership?.company ?? null,
      role: membership?.role
        ? { id: membership.role.id, name: membership.role.name }
        : null,
      permissions:
        membership?.role.permissions.map((rp) => ({
          code: rp.permission.code,
          name: this.humanizePermission(rp.permission.code),
          description: rp.permission.description,
        })) ?? [],
      companyCount: membership ? 1 : 0,
    };
  }

  private mapPlatformUserDetail(
    row: Awaited<ReturnType<PlatformRepository['findPlatformUserById']>>,
  ) {
    if (!row) {
      return null;
    }

    return {
      ...this.mapPlatformUser(row),
      updatedAt: row.updatedAt,
      activations: row.passwordResetTokens.map((token) => ({
        id: token.id,
        status: token.revokedAt
          ? 'CANCELLED'
          : token.usedAt
            ? 'ACTIVATED'
            : token.expiresAt <= new Date()
              ? 'EXPIRED'
              : 'PENDING',
        expiresAt: token.expiresAt,
        usedAt: token.usedAt,
        revokedAt: token.revokedAt,
        createdAt: token.createdAt,
      })),
      sentInvitations: row.sentInvitations,
    };
  }

  private mapActivation(
    row: Awaited<
      ReturnType<PlatformRepository['findActivationsPaginated']>
    >['items'][number],
  ) {
    return {
      id: row.id,
      user: {
        id: row.user.id,
        email: row.user.email,
        firstName: row.user.firstName,
        lastName: row.user.lastName,
        emailVerifiedAt: row.user.emailVerifiedAt,
      },
      status: row.revokedAt
        ? 'CANCELLED'
        : row.usedAt
          ? 'ACTIVATED'
          : row.expiresAt <= new Date()
            ? 'EXPIRED'
            : 'PENDING',
      expiresAt: row.expiresAt,
      usedAt: row.usedAt,
      revokedAt: row.revokedAt,
      createdAt: row.createdAt,
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

  private normalizeUsersQuery(
    query: QueryPlatformUsersDto,
  ): NormalizedQueryPlatformUsers {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.companyId?.trim() && { companyId: query.companyId.trim() }),
      ...(query.membership && { membership: query.membership }),
      ...(query.createdFrom && { createdFrom: new Date(query.createdFrom) }),
      ...(query.createdTo && { createdTo: new Date(query.createdTo) }),
    };
  }

  private normalizeActivationsQuery(
    query: QueryPlatformActivationsDto,
  ): NormalizedQueryPlatformActivations {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.status && { status: query.status }),
    };
  }

  private normalizeInvitationsQuery(
    query: QueryPlatformInvitationsDto,
  ): NormalizedQueryPlatformInvitations {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.companyId?.trim() && { companyId: query.companyId.trim() }),
      ...(query.status && { status: query.status }),
    };
  }

  private humanizePermission(code: string): string {
    return code
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' / ');
  }

  private async assertPlatformUserExists(id: string) {
    const user = await this.platformRepository.findPlatformUserById(id);
    if (!user) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El usuario no existe',
      );
    }
    return user;
  }

  private async sendPasswordSetupEmail(
    userId: string,
    purpose: PasswordResetTokenPurpose = PasswordResetTokenPurpose.RESET_PASSWORD,
  ) {
    const user = await this.assertPlatformUserExists(userId);
    const token = await this.authService.createPasswordResetToken(
      user.id,
      purpose,
    );
    const resetUrl = `${this.getWebUrl()}/reset-password?token=${token}`;

    await this.emailService.sendResetPasswordEmail({
      to: user.email,
      firstName: user.firstName,
      resetUrl,
    });
  }

  private getWebUrl(): string {
    return this.config.get<string>('APP_WEB_URL') ?? 'http://localhost:3000';
  }
}
