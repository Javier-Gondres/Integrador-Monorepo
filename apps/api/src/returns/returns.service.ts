import { Injectable } from '@nestjs/common';
import { SaleStatus } from '@repo/db';
import type { CompanyContext } from 'src/common/company';
import { BusinessException, ErrorCodes } from 'src/common/errors';
import { EmployeesService } from 'src/employees/employees.service';

import { CreateReturnDto } from './dto/create-return.dto';
import {
  NormalizedQueryReturns,
  QueryReturnsDto,
} from './dto/query-returns.dto';
import { ReturnsRepository } from './returns.repository';
import {
  ReturnDetailRecord,
  ReturnListRecord,
  SaleLookupRecord,
} from './returns.selects';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

type SoldEntry = {
  productId: string;
  code: string;
  name: string;
  quantitySold: number;
  subtotalPaid: number;
};

@Injectable()
export class ReturnsService {
  constructor(
    private readonly returnsRepository: ReturnsRepository,
    private readonly employeesService: EmployeesService,
  ) {}

  async findAll(company: CompanyContext, query: QueryReturnsDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.returnsRepository.findPaginatedByCompany(
        company.companyId,
        normalized,
      );

    return {
      items: items.map(mapReturnListItem),
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async findById(id: string, companyId: string) {
    const record = await this.returnsRepository.findByIdInCompany(id, companyId);

    if (!record) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La devolución no existe',
      );
    }

    return mapReturnDetail(record);
  }

  async lookupSaleByNcf(company: CompanyContext, ncf: string) {
    const sale = await this.returnsRepository.findSaleByNcf(
      company.companyId,
      ncf.trim(),
    );

    return this.buildSaleLookup(sale);
  }

  async create(
    dto: CreateReturnDto,
    company: CompanyContext,
    userId: string,
  ) {
    const sale = await this.returnsRepository.findSaleByIdInCompany(
      company.companyId,
      dto.saleId,
    );
    if (!sale) {
      throw BusinessException.notFound(
        ErrorCodes.SALE_NOT_FOUND,
        'La venta no existe',
      );
    }
    if (sale.status !== SaleStatus.COMPLETED) {
      throw new BusinessException(
        ErrorCodes.SALE_NOT_COMPLETED,
        'Solo se pueden devolver productos de ventas completadas',
      );
    }

    const productIds = dto.items.map((item) => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Hay productos duplicados en la devolución',
      );
    }

    const soldByProduct = buildSoldByProduct(sale);
    const alreadyReturned = buildAlreadyReturned(sale);

    const items = dto.items.map((item) => {
      const sold = soldByProduct.get(item.productId);
      if (!sold) {
        throw new BusinessException(
          ErrorCodes.VALIDATION_ERROR,
          'El producto no pertenece a la venta indicada',
        );
      }

      const returnable = round3(
        sold.quantitySold - (alreadyReturned.get(item.productId) ?? 0),
      );
      if (item.quantity > returnable) {
        throw new BusinessException(
          ErrorCodes.RETURN_QUANTITY_EXCEEDED,
          `No se pueden devolver más de ${returnable} unidades de ${sold.name}`,
        );
      }

      const unitPrice = effectiveUnitPrice(sold);
      return {
        productId: item.productId,
        quantity: item.quantity,
        subtotal: round2(unitPrice * item.quantity),
      };
    });

    const subtotal = round2(
      items.reduce((sum, item) => sum + item.subtotal, 0),
    );

    const employee = await this.employeesService.findIdByUserId(
      userId,
      company.companyId,
    );

    const record = await this.returnsRepository.createReturn({
      companyId: company.companyId,
      branchId: sale.branchId,
      saleId: sale.id,
      employeeId: employee.id,
      customerId: sale.customerId,
      userId,
      reason: dto.reason,
      notes: dto.notes?.trim() || null,
      subtotal,
      total: subtotal,
      items,
    });

    return mapReturnDetail(record);
  }

  private buildSaleLookup(sale: SaleLookupRecord | null) {
    if (!sale) {
      throw BusinessException.notFound(
        ErrorCodes.SALE_NOT_FOUND,
        'No se encontró una venta con el NCF indicado',
      );
    }
    if (sale.status !== SaleStatus.COMPLETED) {
      throw new BusinessException(
        ErrorCodes.SALE_NOT_COMPLETED,
        'Solo se pueden devolver productos de ventas completadas',
      );
    }

    const soldByProduct = buildSoldByProduct(sale);
    const alreadyReturned = buildAlreadyReturned(sale);

    return {
      saleId: sale.id,
      ncf: sale.ncf,
      ncfType: sale.ncfType,
      createdAt: sale.createdAt,
      total: Number(sale.total),
      branch: sale.branch,
      customerName: customerName(sale.customer),
      items: [...soldByProduct.values()].map((sold) => {
        const returnableRaw = round3(
          sold.quantitySold - (alreadyReturned.get(sold.productId) ?? 0),
        );
        return {
          productId: sold.productId,
          code: sold.code,
          name: sold.name,
          unitPrice: effectiveUnitPrice(sold),
          quantitySold: sold.quantitySold,
          quantityAlreadyReturned: round3(
            alreadyReturned.get(sold.productId) ?? 0,
          ),
          quantityReturnable: Math.max(0, returnableRaw),
        };
      }),
    };
  }

  private normalizeQuery(query: QueryReturnsDto): NormalizedQueryReturns {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.branchId?.trim() && { branchId: query.branchId.trim() }),
      ...(query.dateFrom && { dateFrom: query.dateFrom }),
      ...(query.dateTo && { dateTo: query.dateTo }),
    };
  }
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function round3(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

function effectiveUnitPrice(sold: SoldEntry): number {
  if (sold.quantitySold <= 0) {
    return 0;
  }
  return round2(sold.subtotalPaid / sold.quantitySold);
}

function customerName(
  customer: { firstName: string; lastName: string } | null,
): string | null {
  return customer ? `${customer.firstName} ${customer.lastName}` : null;
}

function buildSoldByProduct(sale: SaleLookupRecord): Map<string, SoldEntry> {
  const map = new Map<string, SoldEntry>();

  for (const item of sale.items) {
    const quantity = Number(item.quantity);
    const subtotal = Number(item.subtotal);
    const existing = map.get(item.productId);

    if (existing) {
      existing.quantitySold += quantity;
      existing.subtotalPaid += subtotal;
    } else {
      map.set(item.productId, {
        productId: item.productId,
        code: item.product.code,
        name: item.product.name,
        quantitySold: quantity,
        subtotalPaid: subtotal,
      });
    }
  }

  return map;
}

function buildAlreadyReturned(sale: SaleLookupRecord): Map<string, number> {
  const map = new Map<string, number>();

  for (const ret of sale.returns) {
    for (const item of ret.items) {
      map.set(
        item.productId,
        (map.get(item.productId) ?? 0) + Number(item.quantity),
      );
    }
  }

  return map;
}

function mapReturnListItem(record: ReturnListRecord) {
  const creditNote = record.creditNotes[0] ?? null;

  return {
    id: record.id,
    reason: record.reason,
    createdAt: record.createdAt,
    subtotal: Number(record.subtotal),
    total: Number(record.total),
    branch: record.branch,
    ncf: creditNote?.ncf ?? null,
    saleNcf: record.sale?.ncf ?? null,
    customerName: customerName(record.sale?.customer ?? null),
    itemsCount: record._count.items,
  };
}

function mapReturnDetail(record: ReturnDetailRecord) {
  const creditNote = record.creditNotes[0] ?? null;

  return {
    id: record.id,
    reason: record.reason,
    notes: record.notes,
    createdAt: record.createdAt,
    subtotal: Number(record.subtotal),
    total: Number(record.total),
    branch: record.branch,
    ncf: creditNote?.ncf ?? null,
    saleNcf: record.sale?.ncf ?? null,
    customerName: customerName(record.sale?.customer ?? null),
    creditNote: creditNote
      ? {
          id: creditNote.id,
          ncf: creditNote.ncf,
          ncfType: creditNote.ncfType,
          amount: Number(creditNote.amount),
        }
      : null,
    items: record.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      code: item.product.code,
      name: item.product.name,
      quantity: Number(item.quantity),
      subtotal: Number(item.subtotal),
    })),
  };
}
