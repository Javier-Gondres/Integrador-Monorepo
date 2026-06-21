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

import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

/** Catálogo company-wide: no depende del estado de la sucursal del JWT. Ver `common/tenant-access`. */
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @RequirePermissions(Permission.PRODUCTS_READ)
  @Get()
  findAll(@CompanyId() companyId: string, @Query() query: QueryProductsDto) {
    return this.productsService.findPaginatedByCompany(companyId, query);
  }

  @RequirePermissions(Permission.PRODUCTS_READ)
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.productsService.findByIdInCompany(id, companyId);
  }

  @RequirePermissions(Permission.PRODUCTS_CREATE)
  @Post()
  create(@Body() dto: CreateProductDto, @CompanyId() companyId: string) {
    return this.productsService.create(companyId, dto);
  }

  @RequirePermissions(Permission.PRODUCTS_UPDATE)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CompanyId() companyId: string,
  ) {
    return this.productsService.update(id, companyId, dto);
  }

  @RequirePermissions(Permission.PRODUCTS_UPDATE)
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.productsService.activate(id, companyId);
  }

  @RequirePermissions(Permission.PRODUCTS_UPDATE)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.productsService.deactivate(id, companyId);
  }

  @RequirePermissions(Permission.PRODUCTS_DELETE)
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.productsService.remove(id, companyId);
  }
}
