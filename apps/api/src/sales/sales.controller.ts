import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuthContext } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import {
  Company,
  type CompanyContext,
  CompanyId,
  RequireCompany,
} from 'src/common/company';

import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySalesDto } from './dto/query-sales.dto';
import {
  CurrentShiftDto,
  CustomerCreditNotesDto,
  SaleProductsDto,
} from './dto/sale-products.dto';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @RequireCompany()
  @Get()
  findAll(@Company() company: CompanyContext, @Query() query: QuerySalesDto) {
    return this.salesService.findAll(company, query);
  }

  @RequireCompany()
  @Get('products')
  getProducts(
    @Company() company: CompanyContext,
    @Query() query: SaleProductsDto,
  ) {
    return this.salesService.getProducts(company, {
      branchId: query.branchId,
      search: query.search,
      categoryId: query.categoryId,
    });
  }

  @RequireCompany()
  @Get('current-shift')
  getCurrentShift(
    @Company() company: CompanyContext,
    @Auth() auth: AuthContext,
    @Query() query: CurrentShiftDto,
  ) {
    return this.salesService.getCurrentShift(
      company,
      auth.userId,
      query.branchId,
    );
  }

  @RequireCompany()
  @Get('credit-notes')
  getCustomerCreditNotes(
    @Company() company: CompanyContext,
    @Query() query: CustomerCreditNotesDto,
  ) {
    return this.salesService.getCustomerCreditNotes(company, query.customerId);
  }

  @RequireCompany()
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.salesService.findById(id, companyId);
  }

  @RequireCompany()
  @Post()
  create(
    @Body() createSaleDto: CreateSaleDto,
    @Company() company: CompanyContext,
    @Auth() auth: AuthContext,
  ) {
    return this.salesService.create(createSaleDto, company, auth.userId);
  }
}
