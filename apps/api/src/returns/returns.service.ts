import { Injectable } from '@nestjs/common';
import { SaleStatus } from '@repo/db';
import { BranchAccessService } from 'src/branch/branch-access.service';
import type { CompanyContext } from 'src/common/company';
import { BusinessException, ErrorCodes } from 'src/common/errors';
import { EmployeesService } from 'src/employees/employees.service';

import { CreateReturnDto } from './dto/create-return.dto';
import {
  NormalizedQueryReturns,
  QueryReturnsDto,
} from './dto/query-returns.dto';
import {
  buildAlreadyReturned,
  buildSoldByProduct,
  effectiveUnitPrice,
  round3,
} from './returns.helpers';
import { ReturnsRepository } from './returns.repository';
import {
  ReturnDetailRecord,
  ReturnListRecord,
  SaleLookupRecord,
} from './returns.selects';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class ReturnsService {
  constructor(
    private readonly returnsRepository: ReturnsRepository,
    private readonly employeesService: EmployeesService,
    private readonly branchAccessService: BranchAccessService,
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
    const record = await this.returnsRepository.findByIdInCompany(
      id,
      companyId,
    );

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

  async create(dto: CreateReturnDto, company: CompanyContext, userId: string) {
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

    await this.branchAccessService.assertBranchInCompany(
      sale.branchId,
      company.companyId,
    );

    const employee = await this.employeesService.findIdByUserId(
      userId,
      company.companyId,
    );

    const record = await this.returnsRepository.createReturn({
      companyId: company.companyId,
      saleId: dto.saleId,
      employeeId: employee.id,
      userId,
      reason: dto.reason,
      notes: dto.notes?.trim() || null,
      items: dto.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
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
      items: Array.from(soldByProduct.values()).map((sold) => {
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

function customerName(
  customer: { firstName: string; lastName: string } | null,
): string | null {
  return customer ? `${customer.firstName} ${customer.lastName}` : null;
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
