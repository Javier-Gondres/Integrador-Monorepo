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

import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { QueryDiscountsDto } from './dto/query-discounts.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

/** Catálogo company-wide: no depende del estado de la sucursal del JWT. Ver `common/tenant-access`. */
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @RequirePermissions(Permission.DISCOUNTS_READ)
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryDiscountsDto) {
    return this.discountsService.findPaginatedByCompany(companyId, query);
  }

  @RequirePermissions(Permission.DISCOUNTS_READ)
  @Get('current')
  findCurrent(@CompanyId() companyId: string) {
    return this.discountsService.findCurrentByCompany(companyId);
  }

  @RequirePermissions(Permission.DISCOUNTS_READ)
  @Get('applicable/:productId')
  findApplicableToProduct(
    @Param('productId') productId: string,
    @CompanyId() companyId: string,
  ) {
    return this.discountsService.findApplicableToProduct(productId, companyId);
  }

  @RequirePermissions(Permission.DISCOUNTS_READ)
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.discountsService.findByIdInCompany(id, companyId);
  }

  @RequirePermissions(Permission.DISCOUNTS_CREATE)
  @Post()
  create(@Body() dto: CreateDiscountDto, @CompanyId() companyId: string) {
    return this.discountsService.create(companyId, dto);
  }

  @RequirePermissions(Permission.DISCOUNTS_UPDATE)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiscountDto,
    @CompanyId() companyId: string,
  ) {
    return this.discountsService.update(id, companyId, dto);
  }

  @RequirePermissions(Permission.DISCOUNTS_UPDATE)
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.discountsService.activate(id, companyId);
  }

  @RequirePermissions(Permission.DISCOUNTS_UPDATE)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.discountsService.deactivate(id, companyId);
  }

  @RequirePermissions(Permission.DISCOUNTS_DELETE)
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.discountsService.remove(id, companyId);
  }
}
