import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuthContext } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Company, RequireCompany } from 'src/common/company';
import type { CompanyContext } from 'src/common/company/company-context.types';
import { BusinessException, ErrorCodes } from 'src/common/errors';

import { CashRegistersService } from './cash-registers.service';
import { CloseShiftDto } from './dto/close-shift.dto';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { OpenShiftDto } from './dto/open-shift.dto';
import { QueryShiftsDto } from './dto/query-shifts.dto';

@Controller('cash-registers')
export class CashRegistersController {
  constructor(private readonly cashRegistersService: CashRegistersService) {}

  private getBranchId(company: CompanyContext): string {
    if (!company.branchId) {
      throw new BusinessException(
        ErrorCodes.UNAUTHORIZED,
        'Debe seleccionar una sucursal activa',
      );
    }
    return company.branchId;
  }

  @RequireCompany()
  @Get()
  findAll(
    @Company() company: CompanyContext,
    @Query('branchId') queryBranchId?: string,
  ) {
    const branchId = queryBranchId || this.getBranchId(company);
    return this.cashRegistersService.findAllByBranch(branchId);
  }

  @RequireCompany()
  @Post()
  create(
    @Company() company: CompanyContext,
    @Body() dto: CreateCashRegisterDto,
  ) {
    const branchId = dto.branchId || this.getBranchId(company);
    return this.cashRegistersService.create(branchId, dto.name);
  }

  @RequireCompany()
  @Post(':id/open-shift')
  openShift(
    @Param('id') id: string,
    @Body() dto: OpenShiftDto,
    @Company() company: CompanyContext,
    @Auth() auth: AuthContext,
  ) {
    const branchId = this.getBranchId(company);
    return this.cashRegistersService.openShift(id, branchId, auth.userId, dto);
  }

  @RequireCompany()
  @Post(':id/close-shift/:shiftId')
  closeShift(
    @Param('id') id: string,
    @Param('shiftId') shiftId: string,
    @Body() dto: CloseShiftDto,
    @Company() company: CompanyContext,
  ) {
    const branchId = this.getBranchId(company);
    return this.cashRegistersService.closeShift(id, branchId, shiftId, dto);
  }

  @RequireCompany()
  @Get(':id/shifts')
  getShiftsHistory(
    @Param('id') id: string,
    @Company() company: CompanyContext,
    @Query() query: QueryShiftsDto,
  ) {
    const branchId = this.getBranchId(company);
    return this.cashRegistersService.getShiftsHistory(id, branchId, query);
  }
}
