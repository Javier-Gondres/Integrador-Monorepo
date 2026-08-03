import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, prisma, RoleName } from '@repo/db';
import * as bcrypt from 'bcrypt';

import { AuthContext } from '../auth/auth.types';
import { BranchAccessService } from '../branch/branch-access.service';
import { ensureEmployeeForUserRole } from '../common/employees/employee-provisioning';
import { BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import {
  assertAssignableRole,
  assertCanManageUser,
} from '../users/helpers/assert-assignable-role';
import { UsersRepository } from '../users/users.repository';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import {
  NormalizedQueryEmployees,
  QueryEmployeesDto,
} from './dto/query-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesRepository } from './employees.repository';
import type { EmployeeRecord } from './employees.selects';
import { assertCanUpdateEmployee } from './policies/employee-management.policy';

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
      items: items.map((employee) =>
        this.sanitizeEmployeeRecord(employee, companyId),
      ),
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

    return this.sanitizeEmployeeRecord(employee, companyId);
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
      hireDate: new Date(),
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

    return this.sanitizeEmployeeRecord(result.employee, companyId);
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateEmployeeDto,
    auth: AuthContext,
  ) {
    const employee = await this.findByIdInCompany(id, companyId);
    this.assertCanModifyEmployee(auth, employee);

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

    if (dto.roleId !== undefined) {
      await this.applyRoleUpdate(companyId, dto.roleId.trim(), auth, employee);
    }

    if (Object.keys(updateData).length === 0 && dto.roleId === undefined) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    if (Object.keys(updateData).length > 0) {
      await this.employeesRepository.update(id, updateData);
    }

    return this.findByIdInCompany(id, companyId);
  }

  remove(_id: string, _companyId: string, _auth: AuthContext) {
    throw new BusinessException(
      ErrorCodes.UNAUTHORIZED_COMPANY_ACCESS,
      'No se puede eliminar empleados. Usa sacar de la empresa para revocar el acceso.',
      HttpStatus.FORBIDDEN,
    );
  }

  async restore(id: string, companyId: string, auth: AuthContext) {
    const deletedEmployee =
      await this.employeesRepository.findDeletedByIdInCompany(id, companyId);

    if (deletedEmployee) {
      this.assertCanModifyEmployee(auth, deletedEmployee);
    }

    const employee = await this.employeesRepository.restore(id, companyId);

    if (!employee) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El empleado no está eliminado o no pertenece a esta empresa',
      );
    }

    return this.sanitizeEmployeeRecord(employee, companyId);
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

  async upsertLaborProfileForUser(
    userId: string,
    companyId: string,
    dto: UpdateEmployeeDto,
    auth: AuthContext,
  ) {
    const user = await this.usersRepository.findPublicByIdInCompany(
      userId,
      companyId,
    );

    if (!user?.membership) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El usuario no pertenece a esta empresa',
      );
    }

    const membership = user.membership;
    const roleName = membership.role.name;

    if (auth.userId !== userId) {
      assertCanManageUser(auth.role, roleName);
    }

    const branchId = dto.branchId?.trim();
    if (!branchId) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'La sucursal es requerida',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.branchAccessService.assertBranchInCompany(branchId, companyId);

    const userUpdate = getDefinedData({
      firstName: dto.firstName?.trim(),
      lastName: dto.lastName?.trim(),
    });

    if (Object.keys(userUpdate).length > 0) {
      await this.usersRepository.applyUserUpdate(userId, companyId, userUpdate);
    }

    if (dto.roleId !== undefined) {
      const role = await this.usersRepository.findRoleById(dto.roleId.trim());
      if (!role) {
        throw BusinessException.notFound(
          ErrorCodes.RECORD_NOT_FOUND,
          'El rol no existe',
        );
      }

      if (auth.userId === userId) {
        throw new BusinessException(
          ErrorCodes.VALIDATION_ERROR,
          'No puedes cambiar tu propio rol',
          HttpStatus.BAD_REQUEST,
        );
      }

      assertAssignableRole(auth.role, role.name);
      assertCanManageUser(auth.role, roleName);

      const result = await this.usersRepository.applyUserUpdate(
        userId,
        companyId,
        {},
        role.name,
      );

      if (result.status === 'owner_requires_transfer') {
        throw BusinessException.conflict(
          ErrorCodes.VALIDATION_ERROR,
          'El rol OWNER solo puede cambiarse mediante transferencia de propiedad',
        );
      }
      if (result.status === 'membership_not_found') {
        throw BusinessException.notFound(
          ErrorCodes.RECORD_NOT_FOUND,
          'La membresía del usuario no existe',
        );
      }
      if (result.status === 'role_not_found') {
        throw BusinessException.notFound(
          ErrorCodes.RECORD_NOT_FOUND,
          'El rol no existe',
        );
      }
    }

    let effectiveRoleName: RoleName = roleName;
    if (dto.roleId !== undefined) {
      const nextRole = await this.usersRepository.findRoleById(
        dto.roleId.trim(),
      );
      if (nextRole) {
        effectiveRoleName = nextRole.name;
      }
    }

    await prisma.$transaction(async (tx) => {
      await ensureEmployeeForUserRole(tx, {
        userId,
        companyId,
        branchId,
        roleName: effectiveRoleName,
        joinedAt: membership.createdAt,
      });

      const employee = await tx.employee.findFirst({
        where: { userId, companyId },
        select: { id: true },
      });

      if (!employee) {
        throw new BusinessException(
          ErrorCodes.RECORD_NOT_FOUND,
          'No se pudo crear el perfil laboral del miembro',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const laborUpdate: Prisma.EmployeeUpdateInput = {
        branch: { connect: { id: branchId } },
        position: dto.position?.trim() || effectiveRoleName,
      };

      if (dto.phone !== undefined) {
        laborUpdate.phone = dto.phone?.trim() || null;
      }
      if (dto.salary !== undefined) {
        laborUpdate.salary = this.toDecimalOrNull(dto.salary);
      }

      await tx.employee.update({
        where: { id: employee.id },
        data: laborUpdate,
      });
    });

    const employee = await this.employeesRepository.findIdByUserId(
      userId,
      companyId,
    );

    if (!employee) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El perfil laboral no existe',
      );
    }

    return this.findByIdInCompany(employee.id, companyId);
  }

  private sanitizeEmployeeRecord(
    employee: EmployeeRecord,
    companyId: string,
  ): EmployeeRecord {
    return {
      ...employee,
      user: {
        ...employee.user,
        memberships: employee.user.memberships.filter(
          (membership) => membership.companyId === companyId,
        ),
      },
    };
  }

  private assertCanModifyEmployee(
    auth: AuthContext,
    employee: EmployeeRecord,
  ): void {
    assertCanUpdateEmployee(
      { userId: auth.userId, role: auth.role },
      {
        userId: employee.userId,
        role: this.resolveEmployeeRole(employee, employee.companyId),
      },
    );
  }

  private async applyRoleUpdate(
    companyId: string,
    roleId: string,
    auth: AuthContext,
    employee: EmployeeRecord,
  ): Promise<void> {
    const role = await this.usersRepository.findRoleById(roleId);

    if (!role) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El rol no existe',
      );
    }

    const targetRole = this.resolveEmployeeRole(employee, companyId);

    if (auth.userId === employee.userId) {
      throw new BusinessException(
        ErrorCodes.UNAUTHORIZED_COMPANY_ACCESS,
        'No puedes cambiar tu propio rol',
        HttpStatus.FORBIDDEN,
      );
    }

    assertCanManageUser(auth.role, targetRole);
    assertAssignableRole(auth.role, role.name);

    const result = await this.usersRepository.applyUserUpdate(
      employee.userId,
      companyId,
      {},
      role.name,
    );

    if (result.status === 'owner_requires_transfer') {
      throw BusinessException.conflict(
        ErrorCodes.VALIDATION_ERROR,
        'El rol OWNER solo puede cambiarse mediante transferencia de propiedad',
      );
    }
    if (result.status === 'role_not_found') {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El rol no existe',
      );
    }
    if (result.status === 'membership_not_found') {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El empleado no tiene membresía en esta empresa',
      );
    }
  }

  private resolveEmployeeRole(
    employee: EmployeeRecord,
    companyId: string,
  ): RoleName {
    const membership = employee.user.memberships.find(
      (item) => item.companyId === companyId,
    );

    if (!membership) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El empleado no tiene rol en esta empresa',
      );
    }

    return membership.role.name;
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
