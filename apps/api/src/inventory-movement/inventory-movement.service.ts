import { Injectable } from '@nestjs/common';
import { InventoryMovementType } from '@repo/db';
import { BranchRepository } from 'src/branch/branch.repository';
import type { CompanyContext } from 'src/common/company';
import {
  BusinessException,
  ErrorCodes,
  InventoryException,
} from 'src/common/errors';
import { normalizeAdjustmentReason } from 'src/common/inventory/normalize-adjustment-reason';
import { EmployeesService } from 'src/employees/employees.service';
import { ProductsRepository } from 'src/products/products.repository';

import { CreateInventoryAdjustmentDto } from './dto/create-inventory-adjustment.dto';
import {
  NormalizedQueryInventoryMovement,
  QueryInventoryMovementDto,
} from './dto/query-inventory-movement.dto';
import { InventoryMovementRepository } from './inventory-movement.repository';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class InventoryMovementService {
  constructor(
    private readonly inventoryMovementRepository: InventoryMovementRepository,
    private readonly branchRepository: BranchRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly employeesService: EmployeesService,
  ) {}

  async findAllByBranch(
    company: CompanyContext,
    query: QueryInventoryMovementDto,
  ) {
    const branchId = query.branchId ?? company.branchId;
    if (!branchId) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'No hay una sucursal seleccionada',
      );
    }

    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.inventoryMovementRepository.findPaginatedByBranch(
        company.companyId,
        branchId,
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

  async createAdjustment(
    company: CompanyContext,
    userId: string,
    dto: CreateInventoryAdjustmentDto,
  ) {
    //como el usuario de prueba no esta asociado a un empleado se comenta temporalmente la busqueda de empleado
    const [branch, product /* , employee */] = await Promise.all([
      this.branchRepository.findByIdInCompany(dto.branchId, company.companyId),
      this.productsRepository.findByIdInCompany(
        dto.productId,
        company.companyId,
      ),
      // this.employeesService.findIdByUserId(userId, company.companyId),
    ]);

    if (!branch) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La sucursal no existe',
      );
    }
    if (!product) {
      throw InventoryException.productNotFound(dto.productId);
    }

    const adjustmentReason = normalizeAdjustmentReason(
      InventoryMovementType.ADJUSTMENT,
      dto.adjustmentReason,
    );

    return this.inventoryMovementRepository.createAdjustment({
      branchId: dto.branchId,
      productId: dto.productId,
      quantity: dto.quantity,
      adjustmentReason: adjustmentReason!,
      notes: dto.notes?.trim() || null,
      performedByEmployeeId: undefined /* employee.id */,
    });
  }

  private normalizeQuery(
    query: QueryInventoryMovementDto,
  ): NormalizedQueryInventoryMovement {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.type && { type: query.type }),
      ...(query.adjustmentReason && {
        adjustmentReason: query.adjustmentReason,
      }),
      ...(query.dateFrom && { dateFrom: query.dateFrom }),
      ...(query.dateTo && { dateTo: query.dateTo }),
    };
  }
}
