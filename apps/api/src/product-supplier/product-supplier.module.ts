import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { ProductsModule } from '../products/products.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ProductSupplierController } from './product-supplier.controller';
import { ProductSupplierRepository } from './product-supplier.repository';
import { ProductSupplierService } from './product-supplier.service';

@Module({
  imports: [AuthModule, SuppliersModule, ProductsModule],
  controllers: [ProductSupplierController],
  providers: [ProductSupplierRepository, ProductSupplierService],
  exports: [ProductSupplierService, ProductSupplierRepository],
})
export class ProductSupplierModule {}
