import { Controller, Get, Query, ParseIntPipe, Optional } from '@nestjs/common';
import { Permission } from '@repo/shared';
import { Company, type CompanyContext } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @RequirePermissions(Permission.REPORTS_READ)
  @Get('summary')
  getSummary(
    @Company() company: CompanyContext,
    @Query('branchId') branchId?: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.dashboardService.getSummary(
      company,
      branchId,
      isNaN(daysNum) ? 7 : daysNum,
    );
  }
}
