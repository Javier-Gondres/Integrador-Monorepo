import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  Company,
  type CompanyContext,
  RequireCompany,
} from 'src/common/company';

import { CreateReceivablePaymentDto } from './dto/create-receivable-payment.dto';
import { QueryReceivablesDto } from './dto/query-receivables.dto';
import { ReceivablesService } from './receivables.service';

@Controller('receivables')
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @RequireCompany()
  @Get()
  findAll(@Company() company: CompanyContext, @Query() query: QueryReceivablesDto) {
    return this.receivablesService.findCustomers(company, query);
  }

  @RequireCompany()
  @Get('customers/:customerId')
  findByCustomer(
    @Param('customerId') customerId: string,
    @Company() company: CompanyContext,
    @Query() query: QueryReceivablesDto,
  ) {
    return this.receivablesService.findReceivablesByCustomer(customerId, company, query);
  }

  @RequireCompany()
  @Get(':id')
  findOne(@Param('id') id: string, @Company() company: CompanyContext) {
    return this.receivablesService.findById(id, company.companyId);
  }

  @RequireCompany()
  @Post(':id/payments')
  registerPayment(
    @Param('id') id: string,
    @Company() company: CompanyContext,
    @Body() dto: CreateReceivablePaymentDto,
  ) {
    return this.receivablesService.registerPayment(id, company, dto);
  }
}
