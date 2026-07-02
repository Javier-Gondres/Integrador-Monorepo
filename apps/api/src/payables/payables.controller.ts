import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  Company,
  type CompanyContext,
  RequireCompany,
} from 'src/common/company';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPayablesDto } from './dto/query-payables.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { PayablesService } from './payables.service';

@Controller('payables')
export class PayablesController {
  constructor(private readonly payablesService: PayablesService) {}

  @RequireCompany()
  @Post(':id/payments')
  addPayment(
    @Company() company: CompanyContext,
    @Param('id') id: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.payablesService.addPayment(
      id,
      company.companyId,
      createPaymentDto,
    );
  }

  @RequireCompany()
  @Get()
  findAll(
    @Company() company: CompanyContext,
    @Query() query: QueryPayablesDto,
  ) {
    return this.payablesService.findAll(company, query);
  }

  @RequireCompany()
  @Get(':id')
  findById(@Company() company: CompanyContext, @Param('id') id: string) {
    return this.payablesService.findById(id, company.companyId);
  }

  @RequireCompany()
  @Patch(':id')
  update(
    @Company() company: CompanyContext,
    @Param('id') id: string,
    @Body() updatePayableDto: UpdatePayableDto,
  ) {
    return this.payablesService.update(id, company.companyId, updatePayableDto);
  }
}
