import { Injectable } from '@nestjs/common';
import { ReservationStatus } from '@repo/db';
import type { CompanyContext } from 'src/common/company';
import { BusinessException, ErrorCodes } from 'src/common/errors';
import { EmployeesService } from 'src/employees/employees.service';

import { CreateReservationDto } from './dto/create-reservation.dto';
import {
  NormalizedQueryReservations,
  QueryReservationsDto,
} from './dto/query-reservations.dto';
import { ReservationsRepository } from './reservations.repository';
import {
  ReservationDetailRecord,
  ReservationListRecord,
} from './reservations.selects';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    private readonly employeesService: EmployeesService,
  ) {}

  async findAll(company: CompanyContext, query: QueryReservationsDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.reservationsRepository.findPaginatedByCompany(
        company.companyId,
        normalized,
      );

    return {
      items: items.map(mapReservationListItem),
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async findById(id: string, companyId: string) {
    const record = await this.reservationsRepository.findByIdInCompany(
      id,
      companyId,
    );
    if (!record) {
      throw BusinessException.notFound(
        ErrorCodes.RESERVATION_NOT_FOUND,
        'La reserva no existe',
      );
    }
    return mapReservationDetail(record);
  }

  async create(
    dto: CreateReservationDto,
    company: CompanyContext,
    userId: string,
  ) {
    const branchId = dto.branchId?.trim() || company.branchId;
    if (!branchId) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'No hay una sucursal seleccionada',
      );
    }

    const productIds = dto.items.map((item) => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Hay productos duplicados en la reserva',
      );
    }

    const employee = await this.employeesService.findIdByUserId(
      userId,
      company.companyId,
    );

    const record = await this.reservationsRepository.createReservation({
      companyId: company.companyId,
      branchId,
      customerId: dto.customerId?.trim() || null,
      createdByEmployeeId: employee.id,
      userId,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      notes: dto.notes?.trim() || null,
      items: dto.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    return mapReservationDetail(record);
  }

  async cancel(id: string, company: CompanyContext, userId: string) {
    const reservation = await this.reservationsRepository.findStatusInCompany(
      id,
      company.companyId,
    );
    if (!reservation) {
      throw BusinessException.notFound(
        ErrorCodes.RESERVATION_NOT_FOUND,
        'La reserva no existe',
      );
    }
    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new BusinessException(
        ErrorCodes.RESERVATION_NOT_ACTIVE,
        'Solo se pueden cancelar reservas activas',
      );
    }

    const record = await this.reservationsRepository.cancel(
      id,
      company.companyId,
      userId,
      reservation.branchId,
    );

    return mapReservationDetail(record);
  }

  private normalizeQuery(
    query: QueryReservationsDto,
  ): NormalizedQueryReservations {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.branchId?.trim() && { branchId: query.branchId.trim() }),
      ...(query.customerId?.trim() && { customerId: query.customerId.trim() }),
      ...(query.status && { status: query.status }),
    };
  }
}

function customerName(
  customer: { firstName: string; lastName: string } | null,
): string | null {
  return customer ? `${customer.firstName} ${customer.lastName}` : null;
}

function mapReservationListItem(record: ReservationListRecord) {
  return {
    id: record.id,
    status: record.status,
    expiresAt: record.expiresAt,
    notes: record.notes,
    createdAt: record.createdAt,
    branchName: record.branch.name,
    customerName: customerName(record.customer),
    itemsCount: record._count.items,
  };
}

function mapReservationDetail(record: ReservationDetailRecord) {
  const createdByUser = record.createdBy?.user ?? null;

  return {
    id: record.id,
    status: record.status,
    expiresAt: record.expiresAt,
    notes: record.notes,
    createdAt: record.createdAt,
    branch: record.branch,
    customerName: customerName(record.customer),
    createdByName: createdByUser
      ? `${createdByUser.firstName} ${createdByUser.lastName}`
      : null,
    items: record.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      code: item.product.code,
      name: item.product.name,
      quantity: Number(item.quantity),
    })),
  };
}
