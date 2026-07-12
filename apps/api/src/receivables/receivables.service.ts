import { Injectable } from '@nestjs/common';
import { Prisma, ReceivableStatus } from '@repo/db';
import type { CompanyContext } from 'src/common/company';
import { BusinessException, ErrorCodes } from 'src/common/errors';

import { CreateReceivablePaymentDto } from './dto/create-receivable-payment.dto';
import {
  NormalizedQueryReceivables,
  QueryReceivablesDto,
} from './dto/query-receivables.dto';
import { ReceivablesRepository } from './receivables.repository';
import {
  ReceivableDetailRecord,
  ReceivableListRecord,
} from './receivables.selects';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class ReceivablesService {
  constructor(private readonly receivablesRepository: ReceivablesRepository) {}

  async findCustomers(company: CompanyContext, query: QueryReceivablesDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.receivablesRepository.findCustomersPaginatedByCompany(
        company.companyId,
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

  async findReceivablesByCustomer(
    customerId: string,
    company: CompanyContext,
    query: QueryReceivablesDto,
  ) {
    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.receivablesRepository.findReceivablesByCustomer(
        customerId,
        company.companyId,
        normalized,
      );

    return {
      items: items.map(mapReceivableListItem),
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async findById(id: string, companyId: string) {
    const record = await this.receivablesRepository.findByIdInCompany(
      id,
      companyId,
    );
    if (!record) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La cuenta por cobrar no existe',
      );
    }
    return mapReceivableDetail(record);
  }

  async registerPayment(
    id: string,
    company: CompanyContext,
    dto: CreateReceivablePaymentDto,
  ) {
    const record = await this.receivablesRepository.findByIdInCompany(
      id,
      company.companyId,
    );

    if (!record) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La cuenta por cobrar no existe',
      );
    }

    if (record.status === ReceivableStatus.PAID) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'La cuenta por cobrar ya está saldada',
      );
    }

    const currentBalance = new Prisma.Decimal(record.balance);
    const paymentAmount = new Prisma.Decimal(dto.amount);

    if (paymentAmount.greaterThan(currentBalance)) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'El monto del abono no puede ser mayor al balance pendiente',
      );
    }

    const newBalance = currentBalance.minus(paymentAmount);
    let newStatus: ReceivableStatus = record.status;

    if (newBalance.equals(0)) {
      newStatus = ReceivableStatus.PAID;
    } else if (
      newStatus === ReceivableStatus.OPEN ||
      newStatus === ReceivableStatus.OVERDUE
    ) {
      newStatus = ReceivableStatus.PARTIAL;
    }

    const updated = await this.receivablesRepository.addPayment(
      id,
      {
        amount: paymentAmount,
        method: dto.method,
        notes: dto.notes,
      },
      newBalance,
      newStatus,
    );

    return mapReceivableDetail(updated);
  }

  private normalizeQuery(
    query: QueryReceivablesDto,
  ): NormalizedQueryReceivables {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.branchId?.trim() && { branchId: query.branchId.trim() }),
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.status && { status: query.status }),
      ...(query.dateFrom && { dateFrom: query.dateFrom }),
      ...(query.dateTo && { dateTo: query.dateTo }),
    };
  }
}

function mapReceivableListItem(record: ReceivableListRecord) {
  return {
    id: record.id,
    originalAmount: Number(record.originalAmount),
    balance: Number(record.balance),
    dueDate: record.dueDate,
    status: record.status,
    createdAt: record.createdAt,
    sale: {
      id: record.sale.id,
      ncf: record.sale.ncf,
      createdAt: record.sale.createdAt,
      total: Number(record.sale.total),
      branchName: record.sale.branch.name,
    },
  };
}

function mapReceivableDetail(record: ReceivableDetailRecord) {
  return {
    id: record.id,
    originalAmount: Number(record.originalAmount),
    balance: Number(record.balance),
    dueDate: record.dueDate,
    status: record.status,
    createdAt: record.createdAt,
    customer: {
      id: record.customer.id,
      firstName: record.customer.firstName,
      lastName: record.customer.lastName,
    },
    sale: {
      id: record.sale.id,
      ncf: record.sale.ncf,
      createdAt: record.sale.createdAt,
      total: Number(record.sale.total),
      branchName: record.sale.branch.name,
    },
    payments: record.payments.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      method: payment.method,
      notes: payment.notes,
      createdAt: payment.createdAt,
    })),
  };
}
