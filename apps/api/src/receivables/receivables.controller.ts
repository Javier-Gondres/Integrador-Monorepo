import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Permission } from '@repo/shared';
import { Company, type CompanyContext } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { CreateReceivablePaymentDto } from './dto/create-receivable-payment.dto';
import { QueryReceivablesDto } from './dto/query-receivables.dto';
import { ReceivablesService } from './receivables.service';

@Controller('receivables')
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @RequirePermissions(Permission.RECEIVABLES_READ)
  @Get()
  findAll(
    @Company() company: CompanyContext,
    @Query() query: QueryReceivablesDto,
  ) {
    return this.receivablesService.findCustomers(company, query);
  }

  @RequirePermissions(Permission.RECEIVABLES_READ)
  @Get('customers/:customerId')
  findByCustomer(
    @Param('customerId') customerId: string,
    @Company() company: CompanyContext,
    @Query() query: QueryReceivablesDto,
  ) {
    return this.receivablesService.findReceivablesByCustomer(
      customerId,
      company,
      query,
    );
  }

  @RequirePermissions(Permission.RECEIVABLES_READ)
  @Get(':id')
  findOne(@Param('id') id: string, @Company() company: CompanyContext) {
    return this.receivablesService.findById(id, company.companyId);
  }

  @RequirePermissions(Permission.RECEIVABLES_PAY)
  @Post(':id/payments')
  registerPayment(
    @Param('id') id: string,
    @Company() company: CompanyContext,
    @Body() dto: CreateReceivablePaymentDto,
  ) {
    return this.receivablesService.registerPayment(id, company, dto);
  }
}
