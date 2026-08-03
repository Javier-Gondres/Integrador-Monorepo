import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permission } from '@repo/shared';
import { Company, type CompanyContext } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPayablesDto } from './dto/query-payables.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { PayablesService } from './payables.service';

@Controller('payables')
export class PayablesController {
  constructor(private readonly payablesService: PayablesService) {}

  @RequirePermissions(Permission.PAYABLES_PAY)
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

  @RequirePermissions(Permission.PAYABLES_READ)
  @Get()
  findAll(
    @Company() company: CompanyContext,
    @Query() query: QueryPayablesDto,
  ) {
    return this.payablesService.findAll(company, query);
  }

  @RequirePermissions(Permission.PAYABLES_READ)
  @Get(':id')
  findById(@Company() company: CompanyContext, @Param('id') id: string) {
    return this.payablesService.findById(id, company.companyId);
  }

  @RequirePermissions(Permission.PAYABLES_UPDATE)
  @Patch(':id')
  update(
    @Company() company: CompanyContext,
    @Param('id') id: string,
    @Body() updatePayableDto: UpdatePayableDto,
  ) {
    return this.payablesService.update(id, company.companyId, updatePayableDto);
  }
}
