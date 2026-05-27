import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    if (!id?.trim()) {
      throw new BadRequestException('Employee id is required');
    }

    return this.employeesService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      employeeId?: unknown;
      name?: unknown;
      position?: unknown;
      phoneNumber?: unknown;
      branchId?: unknown;
    },
  ) {
    const employeeId =
      typeof body.employeeId === 'string' ? body.employeeId.trim() : '';

    const name = typeof body.name === 'string' ? body.name.trim() : '';

    const position =
      typeof body.position === 'string' ? body.position.trim() : '';

    const phoneNumber =
      typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : '';

    if (!employeeId) {
      throw new BadRequestException('Employee ID is required');
    }

    if (!name) {
      throw new BadRequestException('Name is required');
    }

    if (!position) {
      throw new BadRequestException('Position is required');
    }

    if (!phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }

    const branchId =
      typeof body.branchId === 'string' ? body.branchId.trim() : '';

    if (!branchId) {
      throw new BadRequestException('Branch id is required');
    }

    return this.employeesService.create(
      employeeId,
      name,
      position,
      phoneNumber,
      branchId,
    );
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    body: {
      employeeId?: unknown;
      name?: unknown;
      position?: unknown;
      phoneNumber?: unknown;
      branchId?: unknown;
    },
  ) {
    if (!id?.trim()) {
      throw new BadRequestException('Employee id is required');
    }

    const employeeId =
      typeof body.employeeId === 'string'
        ? body.employeeId.trim() || undefined
        : undefined;

    const name =
      typeof body.name === 'string' ? body.name.trim() || undefined : undefined;

    const position =
      typeof body.position === 'string'
        ? body.position.trim() || undefined
        : undefined;

    const phoneNumber =
      typeof body.phoneNumber === 'string'
        ? body.phoneNumber.trim() || undefined
        : undefined;

    const branchId =
      typeof body.branchId === 'string'
        ? body.branchId.trim() || undefined
        : undefined;

    return this.employeesService.update(id, {
      employeeId,
      name,
      position,
      phoneNumber,
      branchId,
    });
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    if (!id?.trim()) {
      throw new BadRequestException('Employee id is required');
    }

    return this.employeesService.remove(id);
  }
}
