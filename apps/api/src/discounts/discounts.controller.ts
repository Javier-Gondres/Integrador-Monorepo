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

import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { QueryDiscountsDto } from './dto/query-discounts.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @RequireCompany()
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryDiscountsDto) {
    return this.discountsService.findPaginatedByCompany(companyId, query);
  }

  @RequireCompany()
  @Get('current')
  findCurrent(@CompanyId() companyId: string) {
    return this.discountsService.findCurrentByCompany(companyId);
  }

  @RequireCompany()
  @Get('applicable/:productId')
  findApplicableToProduct(
    @Param('productId') productId: string,
    @CompanyId() companyId: string,
  ) {
    return this.discountsService.findApplicableToProduct(productId, companyId);
  }

  @RequireCompany()
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.discountsService.findByIdInCompany(id, companyId);
  }

  @RequireCompany()
  @Post()
  create(@Body() dto: CreateDiscountDto, @CompanyId() companyId: string) {
    return this.discountsService.create(companyId, dto);
  }

  @RequireCompany()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiscountDto,
    @CompanyId() companyId: string,
  ) {
    return this.discountsService.update(id, companyId, dto);
  }

  @RequireCompany()
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.discountsService.activate(id, companyId);
  }

  @RequireCompany()
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.discountsService.deactivate(id, companyId);
  }

  @RequireCompany()
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.discountsService.remove(id, companyId);
  }
}
