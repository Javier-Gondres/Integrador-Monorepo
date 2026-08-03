import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RoleName } from '@repo/db';
import { ALL_PERMISSIONS, type PermissionCode } from '@repo/shared';
import * as bcrypt from 'bcrypt';

import { AuthService } from '../auth/auth.service';
import { AuthException, BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { NormalizedQueryUsers, QueryUsersDto } from './dto/query-users.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import {
  assertAssignableRole,
  assertCanManageUser,
  getAssignableRoles,
} from './helpers/assert-assignable-role';
import type { PublicUserWithMembership } from './users.repository';
import { UsersRepository } from './users.repository';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async findAllByCompany(companyId: string, query: QueryUsersDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } = await this.usersRepository.findManyByCompany(
      companyId,
      normalized,
    );

    return {
      items,
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async findByIdInCompany(id: string, companyId: string) {
    const user = await this.usersRepository.findPublicByIdInCompany(
      id,
      companyId,
    );
    if (!user) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El usuario no existe',
      );
    }
    return this.mapUserResponse(user);
  }

  private mapUserResponse(user: PublicUserWithMembership) {
    const permissionsByCode = new Map(
      ALL_PERMISSIONS.map((permission) => [permission.code, permission]),
    );
    const rolePermissions = user.membership?.role.permissions ?? [];

    return {
      ...user,
      permissions: rolePermissions.map(({ permission }) => ({
        code: permission.code,
        name: this.humanizePermission(permission.code),
        description:
          permission.description ??
          permissionsByCode.get(permission.code as PermissionCode)
            ?.description ??
          null,
      })),
      membership: user.membership
        ? {
            ...user.membership,
            role: {
              ...user.membership.role,
              permissions: undefined,
            },
          }
        : null,
    };
  }

  private humanizePermission(code: string): string {
    return code
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' / ');
  }

  async listRoles(actorRole: RoleName | null) {
    const assignable = new Set(getAssignableRoles(actorRole));
    const roles = await this.usersRepository.findAllRoles();
    return roles.filter((role) => assignable.has(role.name));
  }

  async updateMe(userId: string, companyId: string, dto: UpdateMeDto) {
    await this.findByIdInCompany(userId, companyId);

    const userData = getDefinedData(dto);
    if (userData.firstName !== undefined) {
      userData.firstName = userData.firstName.trim();
    }
    if (userData.lastName !== undefined) {
      userData.lastName = userData.lastName.trim();
    }

    if (Object.keys(userData).length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    await this.usersRepository.applyUserUpdate(userId, companyId, userData);
    return this.findByIdInCompany(userId, companyId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepository.findPasswordHashById(userId);
    if (!user?.isActive) {
      throw AuthException.invalidCredentials();
    }

    const isCurrentValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentValid) {
      throw AuthException.invalidCredentials();
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.updatePasswordHash(userId, passwordHash);

    await this.authService.logoutAllSessions(userId);

    return { message: 'Contraseña actualizada correctamente' };
  }

  async restoreUser(id: string, companyId: string, actorRole: RoleName | null) {
    const target = await this.usersRepository.findSoftDeletedUserInCompany(
      id,
      companyId,
    );

    if (!target) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El usuario no está eliminado o no pertenece a esta empresa',
      );
    }

    this.assertCanManageTargetUser(actorRole, target);

    const result = await this.usersRepository.restoreInCompany(id, companyId);

    if (result.status === 'membership_not_found') {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'No se pudo restaurar la membresía del usuario en esta empresa',
      );
    }

    return this.findByIdInCompany(id, companyId);
  }

  async create(
    companyId: string,
    createUserDto: CreateUserDto,
    actorRole: RoleName | null,
  ) {
    assertAssignableRole(actorRole, createUserDto.role);

    const email = createUserDto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const result = await this.usersRepository.createWithMembership({
      email,
      passwordHash,
      firstName: createUserDto.firstName.trim(),
      lastName: createUserDto.lastName.trim(),
      companyId,
      roleName: createUserDto.role,
    });

    if (result.status === 'role_not_found') {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El rol no existe',
      );
    }

    return result.user;
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    companyIdFromUserAuth: string,
    actorRole: RoleName | null,
  ) {
    const target = await this.findByIdInCompany(id, companyIdFromUserAuth);
    this.assertCanManageTargetUser(actorRole, target);

    const { role, ...otherFields } = updateUserDto;

    if (role !== undefined) {
      assertAssignableRole(actorRole, role);
    }

    const userData = getDefinedData<Omit<UpdateUserDto, 'role'>>(otherFields);

    if (userData.firstName !== undefined) {
      userData.firstName = userData.firstName.trim();
    }
    if (userData.lastName !== undefined) {
      userData.lastName = userData.lastName.trim();
    }

    const hasUserFields = Object.keys(userData).length > 0;
    const hasRole = role !== undefined;

    if (!hasUserFields && !hasRole) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    const result = await this.usersRepository.applyUserUpdate(
      id,
      companyIdFromUserAuth,
      userData,
      role,
    );

    if (result.status === 'role_not_found') {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El rol no existe',
      );
    }
    if (result.status === 'membership_not_found') {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La membresía del usuario no existe',
      );
    }
    if (result.status === 'owner_requires_transfer') {
      throw BusinessException.conflict(
        ErrorCodes.VALIDATION_ERROR,
        'El rol OWNER solo puede cambiarse mediante transferencia de propiedad',
      );
    }

    return this.findByIdInCompany(id, companyIdFromUserAuth);
  }

  async activateUser(
    id: string,
    companyId: string,
    actorRole: RoleName | null,
  ) {
    const target = await this.findByIdInCompany(id, companyId);
    this.assertCanManageTargetUser(actorRole, target);
    await this.usersRepository.activateUser(id);
    return this.findByIdInCompany(id, companyId);
  }

  async deactivateUser(
    id: string,
    companyId: string,
    requesterUserId: string,
    actorRole: RoleName | null,
  ) {
    if (id === requesterUserId) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'No puedes desactivarte a ti mismo',
        HttpStatus.BAD_REQUEST,
      );
    }

    const target = await this.findByIdInCompany(id, companyId);
    this.assertCanManageTargetUser(actorRole, target);
    await this.usersRepository.deactivateUser(id);
    return this.findByIdInCompany(id, companyId);
  }

  async removeMembership(
    id: string,
    companyId: string,
    requesterUserId: string,
    actorRole: RoleName | null,
  ) {
    if (id === requesterUserId) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'No puedes expulsarte a ti mismo',
        HttpStatus.BAD_REQUEST,
      );
    }

    const target = await this.findByIdInCompany(id, companyId);
    this.assertCanManageTargetUser(actorRole, target);

    const result = await this.usersRepository.removeMembershipInCompany(
      id,
      companyId,
    );

    if (result.status === 'membership_not_found') {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La membresía del usuario no existe',
      );
    }
    if (result.status === 'owner_requires_transfer') {
      throw BusinessException.conflict(
        ErrorCodes.VALIDATION_ERROR,
        'No se puede expulsar al OWNER. Primero transfiere la propiedad a otro usuario.',
      );
    }

    return {
      message: 'Usuario expulsado de la empresa correctamente',
      user: result.user,
    };
  }

  async transferOwnership(
    companyId: string,
    newOwnerUserId: string,
    actorUserId: string,
    actorRole: RoleName | null,
  ) {
    if (actorRole !== RoleName.OWNER) {
      throw BusinessException.forbidden(
        ErrorCodes.UNAUTHORIZED_COMPANY_ACCESS,
        'Solo el OWNER puede transferir la propiedad',
      );
    }

    const result = await this.usersRepository.transferOwnershipInCompany(
      companyId,
      newOwnerUserId,
      actorUserId,
    );

    switch (result.status) {
      case 'ok':
        return { message: 'Propiedad transferida correctamente' };
      case 'target_not_member':
        throw BusinessException.notFound(
          ErrorCodes.RECORD_NOT_FOUND,
          'El nuevo OWNER debe pertenecer a esta empresa',
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

  private assertCanManageTargetUser(
    actorRole: RoleName | null,
    target: PublicUserWithMembership,
  ): void {
    const targetRole = target.membership?.role.name;

    if (!targetRole) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El usuario no tiene rol en esta empresa',
      );
    }

    assertCanManageUser(actorRole, targetRole);
  }

  private normalizeQuery(query: QueryUsersDto): NormalizedQueryUsers {
    const page = query.page ?? DEFAULT_PAGE;
    const take = query.take ?? DEFAULT_TAKE;
    const search = query.search?.trim();

    return {
      page,
      take,
      ...(search && { search }),
      ...(query.role !== undefined && { role: query.role }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };
  }
}
