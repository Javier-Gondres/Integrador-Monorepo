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
    const customer = await this.customersRepository.create(companyId, {
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email?.trim() || null,
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
      updateData.email = dto.email?.trim() || null;
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

    return this.customersRepository.update(id, updateData);
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

  private normalizeQuery(query: QueryCustomersDto): NormalizedQueryCustomers {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };
  }
}
