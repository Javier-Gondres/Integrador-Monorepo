import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { EmployeesModule } from 'src/employees/employees.module';

import { ReturnsController } from './returns.controller';
import { ReturnsRepository } from './returns.repository';
import { ReturnsService } from './returns.service';

@Module({
  imports: [AuthModule, EmployeesModule],
  controllers: [ReturnsController],
  providers: [ReturnsRepository, ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
