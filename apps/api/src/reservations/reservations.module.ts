import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { EmployeesModule } from 'src/employees/employees.module';

import { ReservationsController } from './reservations.controller';
import { ReservationsRepository } from './reservations.repository';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [AuthModule, EmployeesModule],
  controllers: [ReservationsController],
  providers: [ReservationsRepository, ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
