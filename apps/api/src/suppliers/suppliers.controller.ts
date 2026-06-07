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

import { CreateSupplierDto } from './dto/create-supplier.dto';
import { QuerySuppliersDto } from './dto/query-suppliers.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersService } from './suppliers.service';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @RequireCompany()
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QuerySuppliersDto) {
    return this.suppliersService.findPaginatedByCompany(companyId, query);
  }

  @RequireCompany()
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.suppliersService.findByIdInCompany(id, companyId);
  }

  @RequireCompany()
  @Post()
  create(@Body() dto: CreateSupplierDto, @CompanyId() companyId: string) {
    return this.suppliersService.create(companyId, dto);
  }

  @RequireCompany()
  @Patch(':id/restore')
  restore(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.suppliersService.restore(id, companyId);
  }

  @RequireCompany()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @CompanyId() companyId: string,
  ) {
    return this.suppliersService.update(id, companyId, dto);
  }

  @RequireCompany()
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.suppliersService.remove(id, companyId);
  }
}
