import { Injectable } from '@nestjs/common';
import { BusinessException, ErrorCodes } from '../common/errors';
import { CashRegistersRepository } from './cash-registers.repository';
import { CloseShiftDto } from './dto/close-shift.dto';
import { OpenShiftDto } from './dto/open-shift.dto';
import { QueryShiftsDto } from './dto/query-shifts.dto';

@Injectable()
export class CashRegistersService {
  constructor(
    private readonly cashRegistersRepository: CashRegistersRepository,
  ) {}

  async findAllByBranch(branchId: string) {
    const registers =
      await this.cashRegistersRepository.findAllByBranch(branchId);

    return registers.map((reg) => {
      const activeShift = reg.shifts[0];

      let turnoActivo = null;

      if (activeShift) {
        let totalVentas = 0;
        let totalEfectivo = 0;
        let totalTarjeta = 0;

        for (const sale of activeShift.sales) {
          const total = Number(sale.total);
          totalVentas += total;

          for (const payment of sale.payments) {
            const amount = Number(payment.amount);
            if (payment.method === 'CASH') {
              totalEfectivo += amount;
            } else if (payment.method === 'CARD') {
              totalTarjeta += amount;
            }
          }
        }

        const employeeName =
          activeShift.cashier?.user?.firstName +
          (activeShift.cashier?.user?.lastName
            ? ' ' + activeShift.cashier?.user?.lastName
            : '');

        turnoActivo = {
          id: activeShift.id,
          estado: 'abierto',
          empleadoNombre: employeeName || 'Desconocido',
          fechaApertura: activeShift.openedAt.toISOString(),
          montoApertura: Number(activeShift.openingAmount),
          totalVentas,
          totalEfectivo,
          totalTarjeta,
        };
      }

      return {
        id: reg.id,
        nombre: reg.name,
        descripcion: '',
        turnoActivo,
      };
    });
  }

  async create(branchId: string, name: string) {
    if (!name.trim()) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'El nombre de la caja es requerido',
      );
    }

    // Validar si existe caja con mismo nombre en sucursal
    const existing =
      await this.cashRegistersRepository.findAllByBranch(branchId);
    if (
      existing.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())
    ) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Ya existe una caja con ese nombre en esta sucursal',
      );
    }

    const reg = await this.cashRegistersRepository.create(
      branchId,
      name.trim(),
    );
    return {
      id: reg.id,
      nombre: reg.name,
      descripcion: '',
      turnoActivo: null,
    };
  }

  async openShift(
    id: string,
    branchId: string,
    userId: string,
    dto: OpenShiftDto,
  ) {
    const register = await this.cashRegistersRepository.findById(id);

    if (!register || register.branchId !== branchId) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'Caja no encontrada',
      );
    }

    if (register.shifts.length > 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'La caja ya tiene un turno abierto',
      );
    }

    let employeeId = dto.empleadoId;

    // Si el frontend envía emp-XXX, ignoramos y buscamos el empleado del usuario logueado
    if (employeeId.startsWith('emp-')) {
      const emp =
        await this.cashRegistersRepository.getEmployeeIdByUserId(userId);
      if (!emp) {
        throw new BusinessException(
          ErrorCodes.VALIDATION_ERROR,
          'El usuario actual no tiene un empleado asociado.',
        );
      }
      employeeId = emp.id;
    }

    await this.cashRegistersRepository.openShift(
      id,
      employeeId,
      dto.montoApertura,
    );

    return { message: 'Turno abierto correctamente' };
  }

  async closeShift(
    id: string,
    branchId: string,
    shiftId: string,
    dto: CloseShiftDto,
  ) {
    const register = await this.cashRegistersRepository.findById(id);

    if (!register || register.branchId !== branchId) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'Caja no encontrada',
      );
    }

    const activeShift = register.shifts[0];
    if (!activeShift || activeShift.id !== shiftId) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'El turno no está activo o no pertenece a esta caja',
      );
    }

    await this.cashRegistersRepository.closeShift(shiftId, dto.montoCierre);

    return { message: 'Turno cerrado correctamente' };
  }

  async getShiftsHistory(id: string, branchId: string, query: QueryShiftsDto) {
    const cashRegister = await this.cashRegistersRepository.findById(id);
    if (!cashRegister || cashRegister.branchId !== branchId) {
      throw new BusinessException(
        ErrorCodes.RECORD_NOT_FOUND,
        'Caja no encontrada',
      );
    }

    const page = query.page ?? 1;
    const take = query.take ?? 10;

    const { items: shifts, total } =
      await this.cashRegistersRepository.findShiftsByRegisterPaginated(id, {
        page,
        take,
      });

    const items = shifts.map((shift) => {
      let totalVentas = 0;
      let totalEfectivo = 0;
      let totalTarjeta = 0;

      for (const sale of shift.sales) {
        totalVentas += Number(sale.total);
        for (const payment of sale.payments) {
          const amount = Number(payment.amount);
          if (payment.method === 'CASH') {
            totalEfectivo += amount;
          } else if (payment.method === 'CARD') {
            totalTarjeta += amount;
          }
        }
      }

      const openingAmount = Number(shift.openingAmount);
      const closingAmount = shift.closingAmount
        ? Number(shift.closingAmount)
        : null;

      let diferencia = null;
      if (closingAmount !== null) {
        diferencia = closingAmount - (openingAmount + totalEfectivo);
      }

      const employeeName =
        shift.cashier?.user?.firstName +
        (shift.cashier?.user?.lastName
          ? ' ' + shift.cashier?.user?.lastName
          : '');

      return {
        id: shift.id,
        empleadoNombre: employeeName,
        montoApertura: openingAmount,
        montoCierre: closingAmount,
        totalVentas,
        totalEfectivo,
        totalTarjeta,
        diferencia,
        abiertoEn: shift.openedAt,
        cerradoEn: shift.closedAt,
      };
    });

    return {
      items,
      meta: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take) || 0,
      },
    };
  }
}
