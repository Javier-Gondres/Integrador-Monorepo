import { Injectable } from "@nestjs/common";
import type { CompanyContext } from "src/common/company";
import { BusinessException, ErrorCodes } from "src/common/errors";

import {
  NormalizedQueryInventoryMovement,
  QueryInventoryMovementDto,
} from "./dto/query-inventory-movement.dto";
import { InventoryMovementRepository } from "./inventory-movement.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class InventoryMovementService {
  constructor(
    private readonly inventoryMovementRepository: InventoryMovementRepository,
  ) {}

  async findAllByBranch(
    company: CompanyContext,
    query: QueryInventoryMovementDto,
  ) {
    const branchId = query.branchId ?? company.branchId;
    if (!branchId) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        "No hay una sucursal seleccionada",
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

  private normalizeQuery(
    query: QueryInventoryMovementDto,
  ): NormalizedQueryInventoryMovement {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.type && { type: query.type }),
      ...(query.dateFrom && { dateFrom: query.dateFrom }),
      ...(query.dateTo && { dateTo: query.dateTo }),
    };
  }
}
