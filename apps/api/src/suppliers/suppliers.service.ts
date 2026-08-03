import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';

import { BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import {
  NormalizedQuerySuppliers,
  QuerySuppliersDto,
} from './dto/query-suppliers.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersRepository } from './suppliers.repository';
import type { SupplierRecord } from './suppliers.selects';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class SuppliersService {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  async findPaginatedByCompany(companyId: string, query: QuerySuppliersDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.suppliersRepository.findPaginatedByCompany(
        companyId,
        normalized,
      );

    return {
      items: items.map(mapSupplier),
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async findByIdInCompany(id: string, companyId: string) {
    const supplier = await this.suppliersRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!supplier) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El proveedor no existe',
      );
    }

    return mapSupplier(supplier);
  }

  async create(companyId: string, dto: CreateSupplierDto) {
    const supplier = await this.suppliersRepository.create(companyId, {
      name: dto.name.trim(),
      contactName: dto.contactName?.trim() || null,
      email: dto.email?.trim().toLowerCase() || null,
      phone: dto.phone?.trim() || null,
      rnc: dto.rnc?.trim() || null,
      address: dto.address?.trim() || null,
      notes: dto.notes?.trim() || null,
      isActive: dto.isActive ?? true,
    });

    return mapSupplier(supplier);
  }

  async update(id: string, companyId: string, dto: UpdateSupplierDto) {
    await this.findByIdInCompany(id, companyId);

    const data = getDefinedData(dto);
    const updateData: Prisma.SupplierUpdateInput = { ...data };

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (dto.contactName !== undefined) {
      updateData.contactName = dto.contactName?.trim() || null;
    }
    if (dto.email !== undefined) {
      updateData.email = dto.email?.trim().toLowerCase() || null;
    }
    if (dto.phone !== undefined) {
      updateData.phone = dto.phone?.trim() || null;
    }
    if (dto.rnc !== undefined) {
      updateData.rnc = dto.rnc?.trim() || null;
    }
    if (dto.address !== undefined) {
      updateData.address = dto.address?.trim() || null;
    }
    if (dto.notes !== undefined) {
      updateData.notes = dto.notes?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    const supplier = await this.suppliersRepository.update(id, updateData);

    return mapSupplier(supplier);
  }

  async remove(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.suppliersRepository.softDelete(id);

    return { message: 'Proveedor eliminado correctamente' };
  }

  async restore(id: string, companyId: string) {
    const supplier = await this.suppliersRepository.restore(id, companyId);

    if (!supplier) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El proveedor no está eliminado o no pertenece a esta empresa',
      );
    }

    return mapSupplier(supplier);
  }

  private normalizeQuery(query: QuerySuppliersDto): NormalizedQuerySuppliers {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };
  }
}

function mapSupplier(supplier: SupplierRecord) {
  const { _count, ...rest } = supplier;

  return {
    ...rest,
    productsCount: _count.products,
  };
}
