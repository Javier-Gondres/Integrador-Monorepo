import { Injectable } from "@nestjs/common";
import { InventoryMovementType } from "@repo/db";
import { BranchAccessService } from "src/branch/branch-access.service";
import type { CompanyContext } from "src/common/company";
import { InventoryException } from "src/common/errors";
import { normalizeAdjustmentReason } from "src/common/inventory/normalize-adjustment-reason";
import { EmployeesService } from "src/employees/employees.service";
import { ProductsRepository } from "src/products/products.repository";

import { CreateInventoryAdjustmentDto } from "./dto/create-inventory-adjustment.dto";
import { CreateWasteDto } from "./dto/create-waste.dto";
import {
  NormalizedQueryInventoryMovement,
  QueryInventoryMovementDto,
} from "./dto/query-inventory-movement.dto";
import { InventoryMovementRepository } from "./inventory-movement.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;
const RECURRING_WASTE_THRESHOLD = 2;

@Injectable()
export class InventoryMovementService {
  constructor(
    private readonly inventoryMovementRepository: InventoryMovementRepository,
    private readonly branchAccessService: BranchAccessService,
    private readonly productsRepository: ProductsRepository,
    private readonly employeesService: EmployeesService,
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

  async getRecurringWasteAlerts(company: CompanyContext, branchId?: string) {
    // Sin branchId en query: alertas de toda la empresa (dashboard).
    // Con branchId: solo esa sucursal (validada). No se usa el JWT como fallback
    // porque Mermas permite registrar en otra sucursal sin switch-branch.
    const resolvedBranchId = branchId?.trim()
      ? await this.branchAccessService.resolveBranchId(
          company.companyId,
          branchId,
          null,
        )
      : undefined;

    return this.inventoryMovementRepository.findRecurringWasteAlerts(
      company.companyId,
      resolvedBranchId,
      RECURRING_WASTE_THRESHOLD,
    );
  }

  async createAdjustment(
    company: CompanyContext,
    userId: string,
    dto: CreateInventoryAdjustmentDto,
  ) {
    await this.branchAccessService.assertBranchInCompany(
      dto.branchId,
      company.companyId,
    );

    const product = await this.productsRepository.findByIdInCompany(
      dto.productId,
      company.companyId,
    );
    if (!product) {
      throw InventoryException.productNotFound(dto.productId);
    }

    const employee = await this.employeesService.findIdByUserId(
      userId,
      company.companyId,
    );

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
      performedByEmployeeId: employee.id,
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
      ...(query.dateFrom && { dateFrom: new Date(query.dateFrom) }),
      ...(query.dateTo && { dateTo: new Date(query.dateTo) }),
    };
  }

  async createWaste(
    company: CompanyContext,
    userId: string,
    dto: CreateWasteDto,
  ) {
    await this.branchAccessService.assertBranchInCompany(
      dto.branchId,
      company.companyId,
    );

    const product = await this.productsRepository.findByIdInCompany(
      dto.productId,
      company.companyId,
    );
    if (!product) {
      throw InventoryException.productNotFound(dto.productId);
    }

    const employee = await this.employeesService.findIdByUserId(
      userId,
      company.companyId,
    );

    const adjustmentReason = normalizeAdjustmentReason(
      InventoryMovementType.WASTE,
      dto.adjustmentReason,
    );

    return this.inventoryMovementRepository.createWasteTransaction({
      branchId: dto.branchId,
      productId: dto.productId,
      quantity: dto.quantity,
      adjustmentReason: adjustmentReason!,
      performedByEmployeeId: employee.id,
      notes: dto.notes?.trim() || null,
      referenceNumber: dto.referenceNumber?.trim() || null,
      audit: {
        companyId: company.companyId,
        userId,
      },
    });
  }
}
