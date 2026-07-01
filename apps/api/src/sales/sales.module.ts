import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DiscountsModule } from 'src/discounts/discounts.module';
import { EmployeesModule } from 'src/employees/employees.module';

import { SalesController } from './sales.controller';
import { SalesRepository } from './sales.repository';
import { SalesService } from './sales.service';

@Module({
  imports: [AuthModule, DiscountsModule, EmployeesModule],
  controllers: [SalesController],
  providers: [SalesRepository, SalesService],
  exports: [SalesService],
})
export class SalesModule {}
