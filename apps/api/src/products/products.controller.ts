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

import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @RequireCompany()
  @Get()
  findAll(
    @CompanyId() companyId: string,
    @Query() query: QueryProductsDto,
  ) {
    return this.productsService.findPaginatedByCompany(companyId, query);
  }

  @RequireCompany()
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.productsService.findByIdInCompany(id, companyId);
  }

  @RequireCompany()
  @Post()
  create(
    @Body() dto: CreateProductDto,
    @CompanyId() companyId: string,
  ) {
    return this.productsService.create(companyId, dto);
  }

  @RequireCompany()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CompanyId() companyId: string,
  ) {
    return this.productsService.update(id, companyId, dto);
  }

  @RequireCompany()
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.productsService.activate(id, companyId);
  }

  @RequireCompany()
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.productsService.deactivate(id, companyId);
  }

  @RequireCompany()
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.productsService.remove(id, companyId);
  }
}
