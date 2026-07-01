import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { BranchModule } from 'src/branch/branch.module';
import { EmployeesModule } from 'src/employees/employees.module';
import { ProductsModule } from 'src/products/products.module';

import { InventoryController } from './inventory.controller';
import { InventoryRepository } from './inventory.repository';
import { InventoryService } from './inventory.service';

@Module({
  imports: [AuthModule, ProductsModule, BranchModule, EmployeesModule],
  controllers: [InventoryController],
  providers: [InventoryRepository, InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
