import { Permission } from '@repo/shared';
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

  @RequirePermissions(Permission.CUSTOMERS_READ)
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryCustomersDto) {
    return this.customersService.findPaginatedByCompany(companyId, query);
  }

  @RequirePermissions(Permission.CUSTOMERS_READ)
  @Get('check-uniqueness')
  checkUniqueness(
    @CompanyId() companyId: string,
    @Query() query: CheckCustomerUniquenessDto,
  ) {
    return this.customersService.checkUniqueness(companyId, query);
  }

  @RequirePermissions(Permission.CUSTOMERS_READ)
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.customersService.findByIdInCompany(id, companyId);
  }

  @RequirePermissions(Permission.CUSTOMERS_CREATE)
  @Post()
  create(@Body() dto: CreateCustomerDto, @CompanyId() companyId: string) {
    return this.customersService.create(companyId, dto);
  }

  @RequirePermissions(Permission.CUSTOMERS_UPDATE)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CompanyId() companyId: string,
  ) {
    return this.customersService.update(id, companyId, dto);
  }

  @RequirePermissions(Permission.CUSTOMERS_UPDATE)
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.customersService.activate(id, companyId);
  }

  @RequirePermissions(Permission.CUSTOMERS_UPDATE)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.customersService.deactivate(id, companyId);
  }

  @RequirePermissions(Permission.CUSTOMERS_DELETE)
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.customersService.remove(id, companyId);
  }
}
