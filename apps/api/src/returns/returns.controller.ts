import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Permission } from '@repo/shared';
import { AuthContext } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Company, type CompanyContext, CompanyId } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { CreateReturnDto } from './dto/create-return.dto';
import { QueryReturnsDto } from './dto/query-returns.dto';
import { SaleLookupDto } from './dto/sale-lookup.dto';
import { ReturnsService } from './returns.service';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @RequirePermissions(Permission.SALES_READ)
  @Get()
  findAll(@Company() company: CompanyContext, @Query() query: QueryReturnsDto) {
    return this.returnsService.findAll(company, query);
  }

  @RequirePermissions(Permission.SALES_READ)
  @Get('sale-lookup')
  lookupSaleByNcf(
    @Company() company: CompanyContext,
    @Query() query: SaleLookupDto,
  ) {
    return this.returnsService.lookupSaleByNcf(company, query.ncf);
  }

  @RequirePermissions(Permission.SALES_READ)
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.returnsService.findById(id, companyId);
  }

  @RequirePermissions(Permission.SALES_CANCEL)
  @Post()
  create(
    @Body() createReturnDto: CreateReturnDto,
    @Company() company: CompanyContext,
    @Auth() auth: AuthContext,
  ) {
    return this.returnsService.create(createReturnDto, company, auth.userId);
  }
}
