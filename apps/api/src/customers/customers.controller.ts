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
import { CompanyId } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { CustomersService } from './customers.service';
import { CheckCustomerUniquenessDto } from './dto/check-customer-uniqueness.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

/** Catálogo company-wide: no depende del estado de la sucursal del JWT. Ver `common/tenant-access`. */
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @RequirePermissions('customers.read')
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryCustomersDto) {
    return this.customersService.findPaginatedByCompany(companyId, query);
  }

  @RequirePermissions('customers.read')
  @Get('check-uniqueness')
  checkUniqueness(
    @CompanyId() companyId: string,
    @Query() query: CheckCustomerUniquenessDto,
  ) {
    return this.customersService.checkUniqueness(companyId, query);
  }

  @RequirePermissions('customers.read')
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.customersService.findByIdInCompany(id, companyId);
  }

  @RequirePermissions('customers.create')
  @Post()
  create(@Body() dto: CreateCustomerDto, @CompanyId() companyId: string) {
    return this.customersService.create(companyId, dto);
  }

  @RequirePermissions('customers.update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CompanyId() companyId: string,
  ) {
    return this.customersService.update(id, companyId, dto);
  }

  @RequirePermissions('customers.update')
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.customersService.activate(id, companyId);
  }

  @RequirePermissions('customers.update')
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.customersService.deactivate(id, companyId);
  }

  @RequirePermissions('customers.delete')
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.customersService.remove(id, companyId);
  }
}
