import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Permission } from '@repo/shared';
import { Company, type CompanyContext, CompanyId } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryPurchasesDto } from './dto/query-purchases.dto';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @RequirePermissions(Permission.PURCHASES_CREATE)
  @Post()
  create(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @Company() company: CompanyContext,
  ) {
    return this.purchasesService.create(createPurchaseDto, company);
  }

  @RequirePermissions(Permission.PURCHASES_READ)
  @Get()
  findAll(
    @Company() company: CompanyContext,
    @Query() query: QueryPurchasesDto,
  ) {
    return this.purchasesService.findAll(company, query);
  }

  @RequirePermissions(Permission.PURCHASES_READ)
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.purchasesService.findById(id, companyId);
  }
}
