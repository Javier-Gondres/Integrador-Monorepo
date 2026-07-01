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

import { CreateProductSupplierDto } from './dto/create-product-supplier.dto';
import { QuerySupplierProductsDto } from './dto/query-supplier-products.dto';
import { UpdateProductSupplierDto } from './dto/update-product-supplier.dto';
import { ProductSupplierService } from './product-supplier.service';

@Controller('suppliers/:supplierId/products')
export class ProductSupplierController {
  constructor(
    private readonly productSupplierService: ProductSupplierService,
  ) {}

  @RequirePermissions(Permission.SUPPLIERS_READ)
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

  @RequirePermissions(Permission.SUPPLIERS_CREATE)
  @Post()
  assign(
    @CompanyId() companyId: string,
    @Param('supplierId') supplierId: string,
    @Body() dto: CreateProductSupplierDto,
  ) {
    return this.productSupplierService.assign(companyId, supplierId, dto);
  }

  @RequirePermissions(Permission.SUPPLIERS_UPDATE)
  @Patch(':productId/activate')
  activate(
    @CompanyId() companyId: string,
    @Param('supplierId') supplierId: string,
    @Param('productId') productId: string,
  ) {
    return this.productSupplierService.activate(
      companyId,
      supplierId,
      productId,
    );
  }

  @RequirePermissions(Permission.SUPPLIERS_UPDATE)
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

  @RequirePermissions(Permission.SUPPLIERS_UPDATE)
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

  @RequirePermissions(Permission.SUPPLIERS_DELETE)
  @Delete(':productId')
  remove(
    @CompanyId() companyId: string,
    @Param('supplierId') supplierId: string,
    @Param('productId') productId: string,
  ) {
    return this.productSupplierService.remove(companyId, supplierId, productId);
  }
}
