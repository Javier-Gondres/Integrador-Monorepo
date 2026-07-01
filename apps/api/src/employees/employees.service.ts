import { Injectable } from '@nestjs/common';
import { Prisma, RoleName } from '@repo/db';
import * as bcrypt from 'bcrypt';

import { BranchAccessService } from '../branch/branch-access.service';
import { BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { assertAssignableRole } from '../users/helpers/assert-assignable-role';
import { UsersRepository } from '../users/users.repository';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import {
  NormalizedQueryEmployees,
  QueryEmployeesDto,
} from './dto/query-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesRepository } from './employees.repository';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class EmployeesService {
  constructor(
    private readonly employeesRepository: EmployeesRepository,
    private readonly branchAccessService: BranchAccessService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findPaginatedByCompany(companyId: string, query: QueryEmployeesDto) {
    const normalized = await this.normalizeQuery(companyId, query);
    const { items, total } =
      await this.employeesRepository.findPaginatedByCompany(
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
    const employee = await this.employeesRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!employee) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El empleado no existe',
      );
    }

    return employee;
  }

  async create(
    companyId: string,
    dto: CreateEmployeeDto,
    actorRole: RoleName | null,
  ) {
    const role = await this.usersRepository.findRoleById(dto.roleId.trim());

    if (!role) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El rol no existe',
      );
    }

    assertAssignableRole(actorRole, role.name);

    const email = dto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const branchId = dto.branchId.trim();
    // Asignación inicial de sucursal; reasignación vía update. Ver employee-branch.policy.
    await this.branchAccessService.assertBranchInCompany(branchId, companyId);

    const result = await this.employeesRepository.create({
      companyId,
      branchId,
      email,
      passwordHash,
      roleId: dto.roleId.trim(),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      phone: dto.phone?.trim() || null,
      position: dto.position?.trim() || null,
      salary: this.toDecimalOrNull(dto.salary),
      hireDate: dto.hireDate ? new Date(dto.hireDate) : null,
    });

    if (result.status === 'role_not_found') {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El rol no existe',
      );
    }

    if (result.status === 'branch_not_found') {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La sucursal no existe en esta empresa',
      );
    }

    return result.employee;
  }

  async update(id: string, companyId: string, dto: UpdateEmployeeDto) {
    await this.findByIdInCompany(id, companyId);

    const data = getDefinedData(dto);
    const updateData: Prisma.EmployeeUpdateInput = {};

    const userUpdate: Prisma.UserUpdateWithoutEmployeeInput = {};
    if (data.firstName !== undefined) {
      userUpdate.firstName = data.firstName.trim();
    }
    if (data.lastName !== undefined) {
      userUpdate.lastName = data.lastName.trim();
    }
    if (Object.keys(userUpdate).length > 0) {
      updateData.user = { update: userUpdate };
    }
    if (dto.phone !== undefined) {
      updateData.phone = dto.phone?.trim() || null;
    }
    if (dto.position !== undefined) {
      updateData.position = dto.position?.trim() || null;
    }
    if (dto.salary !== undefined) {
      updateData.salary = this.toDecimalOrNull(dto.salary);
    }
    if (dto.hireDate !== undefined) {
      updateData.hireDate = dto.hireDate ? new Date(dto.hireDate) : null;
    }
    if (dto.terminationDate !== undefined) {
      updateData.terminationDate = dto.terminationDate
        ? new Date(dto.terminationDate)
        : null;
    }
    if (dto.branchId !== undefined) {
      const branchId = dto.branchId.trim();
      await this.branchAccessService.assertBranchInCompany(branchId, companyId);
      updateData.branch = { connect: { id: branchId } };
    }

    if (Object.keys(updateData).length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    return this.employeesRepository.update(id, updateData);
  }

  async remove(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.employeesRepository.softDelete(id);

    return { message: 'Empleado eliminado correctamente' };
  }

  async restore(id: string, companyId: string) {
    const employee = await this.employeesRepository.restore(id, companyId);

    if (!employee) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El empleado no está eliminado o no pertenece a esta empresa',
      );
    }

    return employee;
  }

  async findIdByUserId(userId: string, companyId: string) {
    const employee = await this.employeesRepository.findIdByUserId(
      userId,
      companyId,
    );

    if (!employee) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El usuario actual no tiene un empleado asociado',
      );
    }

    return employee;
  }

  private async assertBranchInCompany(branchId: string, companyId: string) {
    const branch = await this.employeesRepository.findBranchInCompany(
      branchId,
      companyId,
    );

    if (!branch) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La sucursal no existe en esta empresa',
      );
    }
  }

  private toDecimalOrNull(value: number | undefined): Prisma.Decimal | null {
    if (value === undefined) {
      return null;
    }
    return new Prisma.Decimal(value);
  }

  private async normalizeQuery(
    companyId: string,
    query: QueryEmployeesDto,
  ): Promise<NormalizedQueryEmployees> {
    const branchId = query.branchId?.trim();

    if (branchId) {
      await this.branchAccessService.assertBranchInCompany(branchId, companyId);
    }

    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(branchId && { branchId }),
    };
  }
}
