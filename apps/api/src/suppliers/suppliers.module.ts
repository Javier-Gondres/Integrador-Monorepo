import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { SuppliersController } from './suppliers.controller';
import { SuppliersRepository } from './suppliers.repository';
import { SuppliersService } from './suppliers.service';

@Module({
  imports: [AuthModule],
  controllers: [SuppliersController],
  providers: [SuppliersRepository, SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
