import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  Company,
  type CompanyContext,
  CompanyId,
  RequireCompany,
} from 'src/common/company';

import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryPurchasesDto } from './dto/query-purchases.dto';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @RequireCompany()
  @Post()
  create(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @Company() company: CompanyContext,
  ) {
    return this.purchasesService.create(createPurchaseDto, company);
  }

  @RequireCompany()
  @Get()
  findAll(
    @Company() company: CompanyContext,
    @Query() query: QueryPurchasesDto,
  ) {
    return this.purchasesService.findAll(company, query);
  }

  @RequireCompany()
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.purchasesService.findById(id, companyId);
  }
}
