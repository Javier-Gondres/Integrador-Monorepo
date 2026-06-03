import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { EmployeesController } from './employees.controller';
import { EmployeesRepository } from './employees.repository';
import { EmployeesService } from './employees.service';

@Module({
  imports: [AuthModule],
  controllers: [EmployeesController],
  providers: [EmployeesRepository, EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
