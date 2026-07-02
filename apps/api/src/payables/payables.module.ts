import { Module } from '@nestjs/common';
import { PayablesController } from './payables.controller';
import { PayablesService } from './payables.service';
import { PayablesRepository } from './payables.repository';

@Module({
  controllers: [PayablesController],
  providers: [PayablesService, PayablesRepository],
  exports: [PayablesService],
})
export class PayablesModule {}
