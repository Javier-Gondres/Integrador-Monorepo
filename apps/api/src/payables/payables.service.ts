import { BadRequestException, Injectable } from '@nestjs/common';
import { PayableStatus,Prisma } from '@repo/db';
import type { CompanyContext } from 'src/common/company';
import { BusinessException, ErrorCodes } from 'src/common/errors';

import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  NormalizedQueryPayables,
  QueryPayablesDto,
} from './dto/query-payables.dto';
import { PayablesRepository } from './payables.repository';
import { PayableDetailRecord, PayableListRecord } from './payables.selects';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class PayablesService {
  constructor(private readonly payablesRepository: PayablesRepository) {}

  async findAll(company: CompanyContext, query: QueryPayablesDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.payablesRepository.findPaginatedByCompany(
        company.companyId,
        normalized,
      );

    return {
      items: items.map(mapPayableListItem),
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async findById(id: string, companyId: string) {
    const record = await this.payablesRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!record) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La cuenta por pagar no existe',
      );
    }

    return mapPayableDetail(record);
  }

  async update(id: string, companyId: string, data: { dueDate?: string }) {
    // Verificamos que exista y pertenezca a la empresa
    await this.findById(id, companyId);

    const updateData: { dueDate?: Date } = {};
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    const record = await this.payablesRepository.update(
      id,
      companyId,
      updateData,
    );
    return mapPayableDetail(record);
  }

  async addPayment(id: string, companyId: string, data: CreatePaymentDto) {
    const payable = await this.findById(id, companyId);

    const currentBalance = new Prisma.Decimal(payable.balance);
    const amount = new Prisma.Decimal(data.amount);

    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    if (amount.greaterThan(currentBalance)) {
      throw new BadRequestException(
        `El abono excede el balance actual (${currentBalance.toString()})`,
      );
    }

    const newBalance = currentBalance.minus(amount);
    let newStatus: PayableStatus = PayableStatus.PARTIAL;

    if (newBalance.equals(0)) {
      newStatus = PayableStatus.PAID;
    }

    const record = await this.payablesRepository.addPayment(
      id,
      {
        amount,
        method: data.method,
        notes: data.notes,
      },
      newBalance,
      newStatus,
    );
    return mapPayableDetail(record);
  }

  private normalizeQuery(query: QueryPayablesDto): NormalizedQueryPayables {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.branchId && { branchId: query.branchId }),
      ...(query.supplierId && { supplierId: query.supplierId }),
      ...(query.status && { status: query.status }),
      ...(query.dateFrom && { dateFrom: query.dateFrom }),
      ...(query.dateTo && { dateTo: query.dateTo }),
    };
  }
}

function mapPayableListItem(record: PayableListRecord) {
  const { originalAmount, balance, ...rest } = record;

  return {
    ...rest,
    originalAmount: Number(originalAmount),
    balance: Number(balance),
  };
}

function mapPayableDetail(record: PayableDetailRecord) {
  const { originalAmount, balance, purchase, payments, ...rest } = record;

  return {
    ...rest,
    originalAmount: Number(originalAmount),
    balance: Number(balance),
    purchase: {
      ...purchase,
      total: Number(purchase.total),
      items: purchase.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        subtotal: Number(item.subtotal),
      })),
    },
    payments: payments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
    })),
  };
}
