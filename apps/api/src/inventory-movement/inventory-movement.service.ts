import { Injectable } from '@nestjs/common';
import { BranchAccessService } from 'src/branch/branch-access.service';
import type { CompanyContext } from 'src/common/company';

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
    private readonly branchAccessService: BranchAccessService,
  ) {}

  async findAllByBranch(
    company: CompanyContext,
    query: QueryInventoryMovementDto,
  ) {
    const branchId = await this.branchAccessService.resolveBranchId(
      company.companyId,
      query.branchId,
      company.branchId,
    );

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

  private normalizeQuery(
    query: QueryInventoryMovementDto,
  ): NormalizedQueryInventoryMovement {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.type && { type: query.type }),
      ...(query.dateFrom && {
        dateFrom: new Date(`${query.dateFrom}T00:00:00.000Z`),
      }),
      ...(query.dateTo && {
        dateTo: new Date(`${query.dateTo}T23:59:59.999Z`),
      }),
    };
  }
}
