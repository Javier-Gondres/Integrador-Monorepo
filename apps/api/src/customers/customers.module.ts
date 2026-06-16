import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { CustomersController } from './customers.controller';
import { CustomersRepository } from './customers.repository';
import { CustomersService } from './customers.service';

@Module({
  imports: [AuthModule],
  controllers: [CustomersController],
  providers: [CustomersRepository, CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
