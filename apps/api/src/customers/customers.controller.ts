import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CompanyId, RequireCompany } from 'src/common/company';

import { CustomersService } from './customers.service';
import { CheckCustomerUniquenessDto } from './dto/check-customer-uniqueness.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @RequireCompany()
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryCustomersDto) {
    return this.customersService.findPaginatedByCompany(companyId, query);
  }

  @RequireCompany()
  @Get('check-uniqueness')
  checkUniqueness(
    @CompanyId() companyId: string,
    @Query() query: CheckCustomerUniquenessDto,
  ) {
    return this.customersService.checkUniqueness(companyId, query);
  }

  @RequireCompany()
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.customersService.findByIdInCompany(id, companyId);
  }

  @RequireCompany()
  @Post()
  create(@Body() dto: CreateCustomerDto, @CompanyId() companyId: string) {
    return this.customersService.create(companyId, dto);
  }

  @RequireCompany()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CompanyId() companyId: string,
  ) {
    return this.customersService.update(id, companyId, dto);
  }

  @RequireCompany()
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.customersService.activate(id, companyId);
  }

  @RequireCompany()
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.customersService.deactivate(id, companyId);
  }

  @RequireCompany()
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.customersService.remove(id, companyId);
  }
}
