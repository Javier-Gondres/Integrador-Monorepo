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
import { Permission } from '@repo/shared';
import { CompanyId } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { CreateSupplierDto } from './dto/create-supplier.dto';
import { QuerySuppliersDto } from './dto/query-suppliers.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersService } from './suppliers.service';

/** Catálogo company-wide: no depende del estado de la sucursal del JWT. Ver `common/tenant-access`. */
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @RequirePermissions(Permission.SUPPLIERS_READ)
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QuerySuppliersDto) {
    return this.suppliersService.findPaginatedByCompany(companyId, query);
  }

  @RequirePermissions(Permission.SUPPLIERS_READ)
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.suppliersService.findByIdInCompany(id, companyId);
  }

  @RequirePermissions(Permission.SUPPLIERS_CREATE)
  @Post()
  create(@Body() dto: CreateSupplierDto, @CompanyId() companyId: string) {
    return this.suppliersService.create(companyId, dto);
  }

  @RequirePermissions(Permission.SUPPLIERS_UPDATE)
  @Patch(':id/restore')
  restore(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.suppliersService.restore(id, companyId);
  }

  @RequirePermissions(Permission.SUPPLIERS_UPDATE)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @CompanyId() companyId: string,
  ) {
    return this.suppliersService.update(id, companyId, dto);
  }

  @RequirePermissions(Permission.SUPPLIERS_DELETE)
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.suppliersService.remove(id, companyId);
  }
}
