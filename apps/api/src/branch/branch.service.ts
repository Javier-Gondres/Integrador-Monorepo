import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';

import { BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { BranchRepository } from './branch.repository';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(private readonly branchRepository: BranchRepository) {}

  findAllByCompany(companyId: string) {
    return this.branchRepository.findManyByCompany(companyId);
  }

  async findByIdInCompany(id: string, companyId: string) {
    const branch = await this.branchRepository.findByIdInCompany(id, companyId);

    if (!branch) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La sucursal no existe',
      );
    }

    return branch;
  }

  async create(companyId: string, dto: CreateBranchDto) {
    return this.branchRepository.create(companyId, {
      name: dto.name.trim(),
      address: dto.address?.trim() || null,
    });
  }

  async update(id: string, companyId: string, dto: UpdateBranchDto) {
    await this.findByIdInCompany(id, companyId);

    const data = getDefinedData(dto);
    if (data.name !== undefined) {
      data.name = data.name.trim();
    }

    const updateData: Prisma.BranchUpdateInput = { ...data };
    if (dto.address !== undefined) {
      updateData.address = dto.address?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    return this.branchRepository.update(id, updateData);
  }

  async activate(id: string, companyId: string) {
    const branch = await this.findByIdInCompany(id, companyId);
    if (branch.isActive) {
      return branch;
    }
    await this.branchRepository.activate(id);
    branch.isActive = true;
    return branch;
  }

  async deactivate(id: string, companyId: string) {
    const branch = await this.findByIdInCompany(id, companyId);
    if (!branch.isActive) {
      return branch;
    }
    await this.branchRepository.deactivate(id);
    return this.findByIdInCompany(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.branchRepository.softDelete(id);

    return {
      message: 'Sucursal eliminada correctamente',
    };
  }
}
