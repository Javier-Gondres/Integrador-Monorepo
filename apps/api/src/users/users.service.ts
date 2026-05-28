import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from '../auth/auth.service';
import { UserAuthContext } from '../auth/auth.types';
import { AuthException, BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { NormalizedQueryUsers, QueryUsersDto } from './dto/query-users.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UsersRepository } from './users.repository';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async findAuthContext(userId: string): Promise<UserAuthContext | null> {
    const user = await this.usersRepository.findAuthContextRow(userId);

    if (!user) {
      return null;
    }

    const membership = user.memberships[0] ?? null;

    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      membership: membership
        ? {
            companyId: membership.companyId,
            defaultBranchId: membership.defaultBranchId,
            role: { name: membership.role.name },
          }
        : null,
    };
  }

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
        limit: normalized.limit,
        total,
        totalPages: Math.ceil(total / normalized.limit) || 0,
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
    return user;
  }

  findByEmail(email: string) {
    return this.usersRepository.findByEmailForAuth(email);
  }

  findMe(userId: string, companyId: string) {
    return this.findByIdInCompany(userId, companyId);
  }

  listRoles() {
    return this.usersRepository.findAllRoles();
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

    await this.usersRepository.applyUserUpdate(userId, userData);
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

  async restoreUser(id: string, companyId: string) {
    const isDeleted = await this.usersRepository.isUserSoftDeletedInCompany(
      id,
      companyId,
    );
    if (!isDeleted) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El usuario no está eliminado o no pertenece a esta empresa',
      );
    }

    const result = await this.usersRepository.restoreInCompany(id, companyId);

    if (result.status === 'membership_not_found') {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El usuario no existe',
      );
    }

    return this.findByIdInCompany(id, companyId);
  }

  async create(companyId: string, createUserDto: CreateUserDto) {
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

  updateLastLogin(id: string) {
    return this.usersRepository.updateLastLogin(id);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    companyIdFromUserAuth: string,
  ) {
    await this.findByIdInCompany(id, companyIdFromUserAuth);

    const { role, ...otherFields } = updateUserDto;

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

    return this.findByIdInCompany(id, companyIdFromUserAuth);
  }

  async activateUser(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.usersRepository.activateUser(id);
    return this.findByIdInCompany(id, companyId);
  }

  async deactivateUser(id: string, companyId: string, requesterUserId: string) {
    if (id === requesterUserId) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'No puedes desactivarte a ti mismo',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.findByIdInCompany(id, companyId);
    await this.usersRepository.deactivateUser(id);
    return this.findByIdInCompany(id, companyId);
  }

  async removeUser(id: string, companyId: string, requesterUserId: string) {
    if (id === requesterUserId) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'No puedes eliminarte a ti mismo',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.findByIdInCompany(id, companyId);

    const result = await this.usersRepository.softDeleteInCompany(
      id,
      companyId,
    );

    if (result.status === 'membership_not_found') {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El usuario no existe',
      );
    }

    return {
      message: 'Usuario eliminado correctamente',
      user: result.user,
    };
  }

  private normalizeQuery(query: QueryUsersDto): NormalizedQueryUsers {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const search = query.search?.trim();

    return {
      page,
      limit,
      ...(search && { search }),
      ...(query.role !== undefined && { role: query.role }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };
  }
}
