import { Injectable } from "@nestjs/common";
import { BranchRepository } from "src/branch/branch.repository";
import type { CompanyContext } from "src/common/company";
import { BusinessException, ErrorCodes } from "src/common/errors";
import { ProductsRepository } from "src/products/products.repository";
import { SuppliersService } from "src/suppliers/suppliers.service";

import { CreatePurchaseDto } from "./dto/create-purchase.dto";
import {
  NormalizedQueryPurchases,
  QueryPurchasesDto,
} from "./dto/query-purchases.dto";
import { PurchasesRepository } from "./purchases.repository";
import {
  PurchaseDetailRecord,
  PurchaseListRecord,
} from "./purchases.selects";

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;
const ITBIS_RATE = 0.18; // 18% — impuesto sobre transferencia de bienes (RD)

@Injectable()
export class PurchasesService {
  constructor(
    private readonly purchasesRepository: PurchasesRepository,
    private readonly branchRepository: BranchRepository,
    private readonly suppliersService: SuppliersService,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async findAll(company: CompanyContext, query: QueryPurchasesDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.purchasesRepository.findPaginatedByCompany(
        company.companyId,
        normalized,
      );

    return {
      items: items.map(mapPurchaseListItem),
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async findById(id: string, companyId: string) {
    const record = await this.purchasesRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!record) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        "La orden de compra no existe",
      );
    }

    return mapPurchaseDetail(record);
  }

  async create(dto: CreatePurchaseDto, company: CompanyContext) {
    const branch = await this.branchRepository.findByIdInCompany(
      dto.branchId,
      company.companyId,
    );
    if (!branch) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        "La sucursal no existe",
      );
    }

    // Lanza si el proveedor no pertenece a la empresa.
    await this.suppliersService.findByIdInCompany(
      dto.supplierId,
      company.companyId,
    );

    const productIds = dto.items.map((item) => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        "Hay productos duplicados en la orden",
      );
    }

    const products = await Promise.all(
      productIds.map((id) =>
        this.productsRepository.findByIdInCompany(id, company.companyId),
      ),
    );
    products.forEach((product, index) => {
      if (!product) {
        throw BusinessException.notFound(
          ErrorCodes.PRODUCT_NOT_FOUND,
          `El producto ${productIds[index]} no existe`,
        );
      }
    });

    const items = dto.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      subtotal: round2(item.quantity * item.unitCost),
    }));
    const subtotal = round2(items.reduce((sum, item) => sum + item.subtotal, 0));
    const taxAmount = round2(subtotal * ITBIS_RATE);
    const total = round2(subtotal + taxAmount);

    const record = await this.purchasesRepository.create({
      branchId: dto.branchId,
      supplierId: dto.supplierId,
      invoiceNumber: dto.invoiceNumber?.trim() || null,
      invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : null,
      subtotal,
      taxAmount,
      total,
      items,
    });

    return mapPurchaseDetail(record);
  }

  private normalizeQuery(query: QueryPurchasesDto): NormalizedQueryPurchases {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.branchId && { branchId: query.branchId }),
      ...(query.supplierId && { supplierId: query.supplierId }),
      // El cliente envía instantes ISO completos (inicio/fin del día en su zona
      // horaria), por lo que se usan tal cual para comparar contra createdAt.
      ...(query.dateFrom && { dateFrom: query.dateFrom }),
      ...(query.dateTo && { dateTo: query.dateTo }),
    };
  }
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function mapPurchaseListItem(record: PurchaseListRecord) {
  const { items, _count, subtotal, taxAmount, total, ...rest } = record;

  return {
    ...rest,
    subtotal: Number(subtotal),
    taxAmount: Number(taxAmount),
    total: Number(total),
    itemsCount: _count.items,
    totalUnits: items.reduce((sum, item) => sum + Number(item.quantity), 0),
  };
}

function mapPurchaseDetail(record: PurchaseDetailRecord) {
  const { items, subtotal, taxAmount, total, ...rest } = record;

  return {
    ...rest,
    subtotal: Number(subtotal),
    taxAmount: Number(taxAmount),
    total: Number(total),
    items: items.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      unitCost: Number(item.unitCost),
      subtotal: Number(item.subtotal),
    })),
  };
}
