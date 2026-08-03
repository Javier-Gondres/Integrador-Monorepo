import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { ReceivablesController } from './receivables.controller';
import { ReceivablesRepository } from './receivables.repository';
import { ReceivablesService } from './receivables.service';

@Module({
  imports: [AuthModule],
  controllers: [ReceivablesController],
  providers: [ReceivablesService, ReceivablesRepository],
  exports: [ReceivablesService],
})
export class ReceivablesModule {}
