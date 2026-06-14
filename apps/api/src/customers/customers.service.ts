import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';

import { BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { CustomersRepository } from './customers.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import {
  NormalizedQueryCustomers,
  QueryCustomersDto,
} from './dto/query-customers.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

type UniqueCustomerCheck = {
  email?: string | null;
  cedula?: string | null;
};

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class CustomersService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async findPaginatedByCompany(companyId: string, query: QueryCustomersDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.customersRepository.findPaginatedByCompany(
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
    const customer = await this.customersRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!customer) {
      throw BusinessException.notFound(
        ErrorCodes.CUSTOMER_NOT_FOUND,
        'El cliente no existe',
      );
    }

    return customer;
  }

  async create(companyId: string, dto: CreateCustomerDto) {
    await this.validateUniqueValues(companyId, {
      email: dto.email?.trim() || null,
      cedula: dto.cedula?.trim() || null,
    });

    const customer = await this.customersRepository.create(companyId, {
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email?.trim().toLowerCase() || null,
      phone: dto.phone?.trim() || null,
      address: dto.address?.trim() || null,
      cedula: dto.cedula?.trim() || null,
      isActive: dto.isActive ?? true,
    });

    return customer;
  }

  async update(id: string, companyId: string, dto: UpdateCustomerDto) {
    await this.findByIdInCompany(id, companyId);

    const data = getDefinedData(dto);
    if (data.firstName !== undefined) {
      data.firstName = data.firstName.trim();
    }
    if (data.lastName !== undefined) {
      data.lastName = data.lastName.trim();
    }

    const updateData: Prisma.CustomerUpdateInput = {};
    if (data.firstName !== undefined) {
      updateData.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
      updateData.lastName = data.lastName;
    }
    if (dto.email !== undefined) {
      updateData.email = dto.email?.trim().toLowerCase() || null;
    }
    if (dto.phone !== undefined) {
      updateData.phone = dto.phone?.trim() || null;
    }
    if (dto.address !== undefined) {
      updateData.address = dto.address?.trim() || null;
    }
    if (dto.cedula !== undefined) {
      updateData.cedula = dto.cedula?.trim() || null;
    }
    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    await this.validateUniqueValues(
      companyId,
      {
        email: dto.email?.trim() || null,
        cedula: dto.cedula?.trim() || null,
      },
      id,
    );

    return this.customersRepository.update(id, updateData);
  }

  async checkUniqueness(
    companyId: string,
    query: { email?: string; cedula?: string; excludeId?: string },
  ) {
    const emailTaken = Boolean(
      query.email &&
      (await this.customersRepository.findDuplicateByEmail(
        companyId,
        query.email.trim().toLowerCase(),
        query.excludeId,
      )),
    );

    const cedulaTaken = Boolean(
      query.cedula &&
      (await this.customersRepository.findDuplicateByCedula(
        companyId,
        query.cedula.replace(/\D/g, ''),
        query.excludeId,
      )),
    );

    return {
      emailTaken,
      cedulaTaken,
    };
  }

  async activate(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.customersRepository.activate(id);
    return this.findByIdInCompany(id, companyId);
  }

  async deactivate(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.customersRepository.deactivate(id);
    return this.findByIdInCompany(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.customersRepository.softDelete(id);

    return {
      message: 'Cliente eliminado correctamente',
    };
  }

  private async validateUniqueValues(
    companyId: string,
    values: UniqueCustomerCheck,
    excludeId?: string,
  ) {
    if (values.email) {
      const exists = await this.customersRepository.findDuplicateByEmail(
        companyId,
        values.email.toLowerCase(),
        excludeId,
      );

      if (exists) {
        throw BusinessException.conflict(
          ErrorCodes.EMAIL_ALREADY_EXISTS,
          'Ese correo ya está asociado a otro cliente',
        );
      }
    }

    if (values.cedula) {
      const exists = await this.customersRepository.findDuplicateByCedula(
        companyId,
        values.cedula.replace(/\D/g, ''),
        excludeId,
      );

      if (exists) {
        throw BusinessException.conflict(
          ErrorCodes.DUPLICATE_RECORD,
          'Esa cédula ya está asociada a otro cliente',
        );
      }
    }
  }

  private normalizeQuery(query: QueryCustomersDto): NormalizedQueryCustomers {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };
  }
}
