import { Injectable } from '@nestjs/common';
import { NcfType, PaymentMethod } from '@repo/db';
import { Permission } from '@repo/shared';
import type { AuthContext } from 'src/auth/auth.types';
import type { CompanyContext } from 'src/common/company';
import { BusinessException, ErrorCodes } from 'src/common/errors';
import { DiscountsService } from 'src/discounts/discounts.service';
import { EmployeesService } from 'src/employees/employees.service';

import { CreateSaleDto } from './dto/create-sale.dto';
import { NormalizedQuerySales, QuerySalesDto } from './dto/query-sales.dto';
import { SalesException } from './sales.exception';
import { CreateSaleLine, SalesRepository } from './sales.repository';
import {
  CreditNoteForSaleRecord,
  SaleDetailRecord,
  SaleListRecord,
} from './sales.selects';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;
const ITBIS_RATE = 0.18;

@Injectable()
export class SalesService {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly discountsService: DiscountsService,
    private readonly employeesService: EmployeesService,
  ) {}

  async findAll(company: CompanyContext, query: QuerySalesDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } = await this.salesRepository.findPaginatedByCompany(
      company.companyId,
      normalized,
    );

    return {
      items: items.map(mapSaleListItem),
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async findById(id: string, companyId: string) {
    const record = await this.salesRepository.findByIdInCompany(id, companyId);
    if (!record) {
      throw BusinessException.notFound(
        ErrorCodes.SALE_NOT_FOUND,
        'La venta no existe',
      );
    }
    return mapSaleDetail(record);
  }

  async getCurrentShift(
    company: CompanyContext,
    userId: string,
    branchId?: string,
  ) {
    const resolvedBranchId = this.resolveBranchId(company, branchId);
    const employee = await this.employeesService.findIdByUserId(
      userId,
      company.companyId,
    );
    const shift = await this.salesRepository.findCurrentShift(
      employee.id,
      resolvedBranchId,
    );

    if (!shift) {
      return { shift: null };
    }

    return {
      shift: {
        id: shift.id,
        cashRegisterId: shift.cashRegister.id,
        cashRegisterName: shift.cashRegister.name,
        openingAmount: Number(shift.openingAmount),
        openedAt: shift.openedAt,
      },
    };
  }

  async getCustomerCreditNotes(company: CompanyContext, customerId: string) {
    const notes = await this.salesRepository.findActiveCreditNotesByCustomer(
      company.companyId,
      customerId,
    );
    return { items: notes.map(mapCreditNote) };
  }

  async getProducts(
    company: CompanyContext,
    filters: { branchId?: string; search?: string; categoryId?: string },
  ) {
    const branchId = this.resolveBranchId(company, filters.branchId);
    const [rows, discounts] = await Promise.all([
      this.salesRepository.findProductsForSale(company.companyId, branchId, {
        search: filters.search?.trim(),
        categoryId: filters.categoryId?.trim(),
      }),
      this.discountsService.findCurrentByCompany(company.companyId),
    ]);

    return {
      items: rows.map((row) => {
        const price = Number(row.product.price);
        const discountPercentage = bestDiscountPercentage(
          row.product,
          discounts,
        );
        const finalPrice = round2(
          price - round2((price * discountPercentage) / 100),
        );

        return {
          id: row.product.id,
          code: row.product.code,
          name: row.product.name,
          price,
          discountPercentage,
          finalPrice,
          available: row.available,
          categories: row.product.categories,
        };
      }),
    };
  }

  async create(dto: CreateSaleDto, company: CompanyContext, auth: AuthContext) {
    const userId = auth.userId;
    const branchId = this.resolveBranchId(company, dto.branchId);
    const customerId = dto.customerId?.trim() || null;
    if (!customerId) {
      throw SalesException.customerRequired();
    }
    const creditNoteIds = dto.creditNoteIds ?? [];
    const payments = dto.payments ?? [];

    const soldAt = this.resolveSoldAt(dto.soldAt, auth);

    const productIds = dto.items.map((item) => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Hay productos duplicados en la venta',
      );
    }

    const hasCreditPayment = payments.some(
      (payment) => payment.method === PaymentMethod.CREDIT,
    );
    if ((hasCreditPayment || creditNoteIds.length > 0) && !customerId) {
      throw SalesException.customerRequiredForCredit();
    }

    // Snapshot de descuentos por línea (producto + categorías, máximo %).
    const lines: CreateSaleLine[] = [];
    for (const item of dto.items) {
      const discount = await this.discountsService.findApplicableToProduct(
        item.productId,
        company.companyId,
      );

      const unitPrice = discount.originalPrice;
      const grossLine = round2(unitPrice * item.quantity);
      const discountAmount = round2(discount.discountAmount * item.quantity);
      const subtotal = round2(grossLine - discountAmount);

      lines.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        discountPercentage: discount.discountPercentage,
        discountAmount,
        subtotal,
      });
    }

    const subtotal = round2(
      lines.reduce((sum, line) => sum + line.subtotal, 0),
    );
    const taxAmount = round2(subtotal * ITBIS_RATE);
    const total = round2(subtotal + taxAmount);

    const employee = await this.employeesService.findIdByUserId(
      userId,
      company.companyId,
    );

    const record = await this.salesRepository.createSale({
      companyId: company.companyId,
      branchId,
      customerId,
      reservationId: dto.reservationId?.trim() || null,
      employeeId: employee.id,
      userId,
      ncfType: dto.ncfType ?? NcfType.CONSUMIDOR_FINAL,
      subtotal,
      taxAmount,
      total,
      lines,
      payments: payments.map((payment) => ({
        method: payment.method,
        amount: payment.amount,
      })),
      creditNoteIds,
      soldAt,
    });

    return mapSaleDetail(record);
  }

  private resolveSoldAt(
    soldAt: string | undefined,
    auth: AuthContext,
  ): Date | null {
    if (!soldAt) {
      return null;
    }
    if (!auth.permissions.includes(Permission.SALES_BACKDATE)) {
      throw SalesException.backdateForbidden();
    }
    const parsed = new Date(soldAt);
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() > Date.now()) {
      throw SalesException.backdateInvalid();
    }
    return parsed;
  }

  private resolveBranchId(company: CompanyContext, branchId?: string): string {
    const resolved = branchId?.trim() || company.branchId;
    if (!resolved) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'No hay una sucursal seleccionada',
      );
    }
    return resolved;
  }

  private normalizeQuery(query: QuerySalesDto): NormalizedQuerySales {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.branchId?.trim() && { branchId: query.branchId.trim() }),
      ...(query.customerId?.trim() && { customerId: query.customerId.trim() }),
      ...(query.cashierId?.trim() && { cashierId: query.cashierId.trim() }),
      ...(query.cashRegisterId?.trim() && {
        cashRegisterId: query.cashRegisterId.trim(),
      }),
      ...(query.status && { status: query.status }),
      ...(query.dateFrom && { dateFrom: query.dateFrom }),
      ...(query.dateTo && { dateTo: query.dateTo }),
    };
  }
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

type CurrentDiscount = {
  percentage: number;
  products: { id: string }[];
  categories: { id: string }[];
  excludedProducts: { id: string }[];
};

/**
 * Mejor descuento aplicable a un producto (producto directo o por categoría,
 * menos exclusiones). Devuelve el porcentaje máximo, nunca acumula. Refleja la
 * misma regla que `DiscountsService.findApplicableToProduct`, pero en memoria
 * para todo el catálogo del listado.
 */
function bestDiscountPercentage(
  product: { id: string; categories: { id: string }[] },
  discounts: CurrentDiscount[],
): number {
  let best = 0;
  for (const discount of discounts) {
    const directMatch = discount.products.some((p) => p.id === product.id);
    const categoryMatch =
      discount.categories.some((category) =>
        product.categories.some((pc) => pc.id === category.id),
      ) && !discount.excludedProducts.some((p) => p.id === product.id);

    if ((directMatch || categoryMatch) && discount.percentage > best) {
      best = discount.percentage;
    }
  }
  return best;
}

function customerName(
  customer: { firstName: string; lastName: string } | null,
): string | null {
  return customer ? `${customer.firstName} ${customer.lastName}` : null;
}

function mapSaleListItem(record: SaleListRecord) {
  return {
    id: record.id,
    ncf: record.ncf,
    ncfType: record.ncfType,
    status: record.status,
    subtotal: Number(record.subtotal),
    taxAmount: Number(record.taxAmount),
    total: Number(record.total),
    createdAt: record.createdAt,
    branchName: record.branch.name,
    customerName: customerName(record.customer),
    cashierName: record.cashier?.user
      ? `${record.cashier.user.firstName} ${record.cashier.user.lastName}`
      : null,
    cashRegisterName: record.cashShift?.cashRegister?.name ?? null,
    itemsCount: record._count.items,
  };
}

function mapCreditNote(record: CreditNoteForSaleRecord) {
  return {
    id: record.id,
    ncf: record.ncf,
    ncfType: record.ncfType,
    amount: Number(record.amount),
    createdAt: record.createdAt,
  };
}

function mapSaleDetail(record: SaleDetailRecord) {
  const cashierUser = record.cashier?.user ?? null;

  return {
    id: record.id,
    ncf: record.ncf,
    ncfType: record.ncfType,
    status: record.status,
    subtotal: Number(record.subtotal),
    taxAmount: Number(record.taxAmount),
    total: Number(record.total),
    createdAt: record.createdAt,
    reservationId: record.reservationId,
    company: {
      name: record.branch.company.name,
      rnc: record.branch.company.rnc,
      address: record.branch.company.address,
      phone: record.branch.company.phone,
    },
    branch: {
      id: record.branch.id,
      name: record.branch.name,
      address: record.branch.address,
    },
    customerName: customerName(record.customer),
    customer: record.customer
      ? {
          name: `${record.customer.firstName} ${record.customer.lastName}`,
          rnc: record.customer.rnc,
          cedula: record.customer.cedula,
          address: record.customer.address,
          phone: record.customer.phone,
        }
      : null,
    cashierName: cashierUser
      ? `${cashierUser.firstName} ${cashierUser.lastName}`
      : null,
    items: record.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      code: item.product.code,
      name: item.product.name,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discountPercentage:
        item.discountPercentage !== null ? Number(item.discountPercentage) : 0,
      discountAmount:
        item.discountAmount !== null ? Number(item.discountAmount) : 0,
      subtotal: Number(item.subtotal),
    })),
    payments: record.payments.map((payment) => ({
      id: payment.id,
      method: payment.method,
      amount: Number(payment.amount),
    })),
    creditNotesApplied: record.redeemedCreditNotes.map((note) => ({
      id: note.id,
      ncf: note.ncf,
      amount: Number(note.amount),
    })),
    accountReceivable: record.accountReceivable
      ? {
          id: record.accountReceivable.id,
          balance: Number(record.accountReceivable.balance),
          dueDate: record.accountReceivable.dueDate,
          status: record.accountReceivable.status,
        }
      : null,
  };
}
