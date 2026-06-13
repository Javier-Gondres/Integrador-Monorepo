import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductSupplierService } from './product-supplier.service';
import { CreateProductSupplierDto } from './dto/create-product-supplier.dto';
import { UpdateProductSupplierDto } from './dto/update-product-supplier.dto';

@Controller('product-supplier')
export class ProductSupplierController {
  constructor(private readonly productSupplierService: ProductSupplierService) {}

  @Post()
  create(@Body() createProductSupplierDto: CreateProductSupplierDto) {
    return this.productSupplierService.create(createProductSupplierDto);
  }

  @Get()
  findAll() {
    return this.productSupplierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productSupplierService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductSupplierDto: UpdateProductSupplierDto) {
    return this.productSupplierService.update(+id, updateProductSupplierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productSupplierService.remove(+id);
  }
}
