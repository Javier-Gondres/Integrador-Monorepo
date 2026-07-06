import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { BranchModule } from 'src/branch/branch.module';
import { ProductsModule } from 'src/products/products.module';

import { TransfersController } from './transfers.controller';
import { TransfersRepository } from './transfers.repository';
import { TransfersService } from './transfers.service';

@Module({
  imports: [AuthModule, BranchModule, ProductsModule],
  controllers: [TransfersController],
  providers: [TransfersRepository, TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
