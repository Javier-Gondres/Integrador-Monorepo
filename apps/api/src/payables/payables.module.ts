import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { PayablesController } from './payables.controller';
import { PayablesRepository } from './payables.repository';
import { PayablesService } from './payables.service';

@Module({
  imports: [AuthModule],
  controllers: [PayablesController],
  providers: [PayablesService, PayablesRepository],
  exports: [PayablesService],
})
export class PayablesModule {}
