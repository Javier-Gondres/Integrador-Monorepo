import { Module } from '@nestjs/common';

import { CashRegistersController } from './cash-registers.controller';
import { CashRegistersRepository } from './cash-registers.repository';
import { CashRegistersService } from './cash-registers.service';

@Module({
  controllers: [CashRegistersController],
  providers: [CashRegistersService, CashRegistersRepository],
  exports: [CashRegistersService],
})
export class CashRegistersModule {}
