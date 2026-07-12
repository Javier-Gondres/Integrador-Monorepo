import { Module } from '@nestjs/common';

import { ReceivablesController } from './receivables.controller';
import { ReceivablesRepository } from './receivables.repository';
import { ReceivablesService } from './receivables.service';

@Module({
  controllers: [ReceivablesController],
  providers: [ReceivablesService, ReceivablesRepository],
  exports: [ReceivablesService],
})
export class ReceivablesModule {}
