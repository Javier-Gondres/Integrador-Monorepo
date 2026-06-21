import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuthContext } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { BranchAccessService } from 'src/branch/branch-access.service';
import { Company } from 'src/common/company';
import type { CompanyContext } from 'src/common/company/company-context.types';
import { RequirePermissions } from 'src/common/permissions';

import { CashRegistersService } from './cash-registers.service';
import { CloseShiftDto } from './dto/close-shift.dto';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { OpenShiftDto } from './dto/open-shift.dto';
import { QueryShiftsDto } from './dto/query-shifts.dto';

/** Branch-scoped: valida sucursal activa vía BranchAccessService. Apertura de turno: `employees/policies/employee-branch.policy`. */
@Controller('cash-registers')
export class CashRegistersController {
  constructor(
    private readonly cashRegistersService: CashRegistersService,
    private readonly branchAccessService: BranchAccessService,
  ) {}

  private resolveBranchId(
    company: CompanyContext,
    branchId?: string,
  ): Promise<string> {
    return this.branchAccessService.resolveBranchId(
      company.companyId,
      branchId,
      company.branchId,
    );
  }

  @RequirePermissions('cash.read')
  @Get()
  async findAll(
    @Company() company: CompanyContext,
    @Query('branchId') queryBranchId?: string,
  ) {
    const branchId = await this.resolveBranchId(company, queryBranchId);
    return this.cashRegistersService.findAllByBranch(branchId);
  }

  @RequirePermissions('cash.manage')
  @Post()
  async create(
    @Company() company: CompanyContext,
    @Body() dto: CreateCashRegisterDto,
  ) {
    const branchId = await this.resolveBranchId(company, dto.branchId);
    return this.cashRegistersService.create(branchId, dto.name);
  }

  @RequirePermissions('cash.open')
  @Post(':id/open-shift')
  async openShift(
    @Param('id') id: string,
    @Body() dto: OpenShiftDto,
    @Company() company: CompanyContext,
    @Auth() auth: AuthContext,
  ) {
    const branchId = await this.resolveBranchId(company);
    return this.cashRegistersService.openShift(
      id,
      branchId,
      company.companyId,
      auth.userId,
      dto,
    );
  }

  @RequirePermissions('cash.close')
  @Post(':id/close-shift/:shiftId')
  async closeShift(
    @Param('id') id: string,
    @Param('shiftId') shiftId: string,
    @Body() dto: CloseShiftDto,
    @Company() company: CompanyContext,
  ) {
    const branchId = await this.resolveBranchId(company);
    return this.cashRegistersService.closeShift(id, branchId, shiftId, dto);
  }

  @RequirePermissions('cash.read')
  @Get(':id/shifts')
  async getShiftsHistory(
    @Param('id') id: string,
    @Company() company: CompanyContext,
    @Query() query: QueryShiftsDto,
  ) {
    const branchId = await this.resolveBranchId(company);
    return this.cashRegistersService.getShiftsHistory(id, branchId, query);
  }
}
