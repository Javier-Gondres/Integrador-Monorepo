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

import { CreateProductSupplierDto } from './dto/create-product-supplier.dto';
import { QuerySupplierProductsDto } from './dto/query-supplier-products.dto';
import { UpdateProductSupplierDto } from './dto/update-product-supplier.dto';
import { ProductSupplierService } from './product-supplier.service';

@Controller('suppliers/:supplierId/products')
export class ProductSupplierController {
  constructor(
    private readonly productSupplierService: ProductSupplierService,
  ) {}

  @RequireCompany()
  @Get()
  findAll(
    @CompanyId() companyId: string,
    @Param('supplierId') supplierId: string,
    @Query() query: QuerySupplierProductsDto,
  ) {
    return this.productSupplierService.findPaginatedBySupplier(
      companyId,
      supplierId,
      query,
    );
  }

  @RequireCompany()
  @Post()
  assign(
    @CompanyId() companyId: string,
    @Param('supplierId') supplierId: string,
    @Body() dto: CreateProductSupplierDto,
  ) {
    return this.productSupplierService.assign(companyId, supplierId, dto);
  }

  @RequireCompany()
  @Patch(':productId/activate')
  activate(
    @CompanyId() companyId: string,
    @Param('supplierId') supplierId: string,
    @Param('productId') productId: string,
  ) {
    return this.productSupplierService.activate(companyId, supplierId, productId);
  }

  @RequireCompany()
  @Patch(':productId/deactivate')
  deactivate(
    @CompanyId() companyId: string,
    @Param('supplierId') supplierId: string,
    @Param('productId') productId: string,
  ) {
    return this.productSupplierService.deactivate(
      companyId,
      supplierId,
      productId,
    );
  }

  @RequireCompany()
  @Patch(':productId')
  update(
    @CompanyId() companyId: string,
    @Param('supplierId') supplierId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductSupplierDto,
  ) {
    return this.productSupplierService.update(
      companyId,
      supplierId,
      productId,
      dto,
    );
  }

  @RequireCompany()
  @Delete(':productId')
  remove(
    @CompanyId() companyId: string,
    @Param('supplierId') supplierId: string,
    @Param('productId') productId: string,
  ) {
    return this.productSupplierService.remove(companyId, supplierId, productId);
  }
}
