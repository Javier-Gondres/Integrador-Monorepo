import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserAuthContext } from '../auth/auth.types';
import { BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { CreateUserDto } from './dto/createUser.dto';
import {
  NormalizedQueryUsers,
  QueryUsersDto,
} from './dto/query-users.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UsersRepository } from './users.repository';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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

  findById(id: string) {
    return this.usersRepository.findPublicById(id);
  }

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    // P2002 (email duplicado) lo traduce GlobalExceptionFilter → 409 EMAIL_ALREADY_EXISTS
    return this.usersRepository.create({
      email,
      passwordHash,
      firstName: createUserDto.firstName.trim(),
      lastName: createUserDto.lastName.trim(),
    });
  }

  updateLastLogin(id: string) {
    return this.usersRepository.updateLastLogin(id);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    companyIdFromUserAuth: string,
  ) {
    const user = await this.existingUser(id);

    if (user.membership?.companyId !== companyIdFromUserAuth) {
      throw BusinessException.forbidden(
        ErrorCodes.UNAUTHORIZED_COMPANY_ACCESS,
        'El usuario no existe en la empresa',
      );
    }

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

    return this.findById(id);
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

  private async existingUser(id: string) {
    const user = await this.usersRepository.findPublicById(id);
    if (!user) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El usuario no existe',
      );
    }
    return user;
  }
}
