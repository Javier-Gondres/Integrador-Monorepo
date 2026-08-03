import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { BranchModule } from 'src/branch/branch.module';
import { EmployeesModule } from 'src/employees/employees.module';

import { CashRegistersController } from './cash-registers.controller';
import { CashRegistersRepository } from './cash-registers.repository';
import { CashRegistersService } from './cash-registers.service';

@Module({
  imports: [AuthModule, BranchModule, EmployeesModule],
  controllers: [CashRegistersController],
  providers: [CashRegistersService, CashRegistersRepository],
  exports: [CashRegistersService],
})
export class CashRegistersModule {}
