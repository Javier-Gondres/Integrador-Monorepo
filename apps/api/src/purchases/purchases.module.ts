import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { BranchModule } from 'src/branch/branch.module';
import { ProductsModule } from 'src/products/products.module';
import { SuppliersModule } from 'src/suppliers/suppliers.module';

import { PurchasesController } from './purchases.controller';
import { PurchasesRepository } from './purchases.repository';
import { PurchasesService } from './purchases.service';

@Module({
  imports: [AuthModule, BranchModule, SuppliersModule, ProductsModule],
  controllers: [PurchasesController],
  providers: [PurchasesRepository, PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
