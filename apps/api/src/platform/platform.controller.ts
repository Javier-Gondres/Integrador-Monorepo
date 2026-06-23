import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RequirePlatformAdmin } from 'src/common/platform';

import { CreatePlatformCompanyDto } from './dto/create-platform-company.dto';
import { QueryPlatformCompaniesDto } from './dto/query-platform-companies.dto';
import { PlatformService } from './platform.service';

/**
 * Administración de plataforma (SaaS).
 *
 * Protegido por `@RequirePlatformAdmin()` — sin CompanyGuard ni PermissionGuard.
 */
@Controller('platform')
@RequirePlatformAdmin()
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get('overview')
  getOverview() {
    return this.platformService.getOverview();
  }

  @Get('companies')
  findAllCompanies(@Query() query: QueryPlatformCompaniesDto) {
    return this.platformService.findAllCompanies(query);
  }

  @Get('companies/:id')
  findCompanyById(@Param('id') id: string) {
    return this.platformService.findCompanyById(id);
  }

  @Post('companies')
  createCompany(@Body() dto: CreatePlatformCompanyDto) {
    return this.platformService.createCompany(dto);
  }

  @Patch('companies/:id/activate')
  activateCompany(@Param('id') id: string) {
    return this.platformService.activateCompany(id);
  }

  @Patch('companies/:id/deactivate')
  deactivateCompany(@Param('id') id: string) {
    return this.platformService.deactivateCompany(id);
  }
}
