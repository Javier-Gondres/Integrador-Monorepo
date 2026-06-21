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

import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { QueryDiscountsDto } from './dto/query-discounts.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

/** Catálogo company-wide: no depende del estado de la sucursal del JWT. Ver `common/tenant-access`. */
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @RequirePermissions('discounts.read')
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryDiscountsDto) {
    return this.discountsService.findPaginatedByCompany(companyId, query);
  }

  @RequirePermissions('discounts.read')
  @Get('current')
  findCurrent(@CompanyId() companyId: string) {
    return this.discountsService.findCurrentByCompany(companyId);
  }

  @RequirePermissions('discounts.read')
  @Get('applicable/:productId')
  findApplicableToProduct(
    @Param('productId') productId: string,
    @CompanyId() companyId: string,
  ) {
    return this.discountsService.findApplicableToProduct(productId, companyId);
  }

  @RequirePermissions('discounts.read')
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.discountsService.findByIdInCompany(id, companyId);
  }

  @RequirePermissions('discounts.create')
  @Post()
  create(@Body() dto: CreateDiscountDto, @CompanyId() companyId: string) {
    return this.discountsService.create(companyId, dto);
  }

  @RequirePermissions('discounts.update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiscountDto,
    @CompanyId() companyId: string,
  ) {
    return this.discountsService.update(id, companyId, dto);
  }

  @RequirePermissions('discounts.update')
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.discountsService.activate(id, companyId);
  }

  @RequirePermissions('discounts.update')
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.discountsService.deactivate(id, companyId);
  }

  @RequirePermissions('discounts.delete')
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.discountsService.remove(id, companyId);
  }
}
