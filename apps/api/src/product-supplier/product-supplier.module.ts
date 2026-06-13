import { Module } from '@nestjs/common';
import { ProductSupplierService } from './product-supplier.service';
import { ProductSupplierController } from './product-supplier.controller';

@Module({
  controllers: [ProductSupplierController],
  providers: [ProductSupplierService],
})
export class ProductSupplierModule {}
