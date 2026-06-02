import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { BranchModule } from 'src/branch/branch.module';
import { CompanyModule } from 'src/company/company.module';

import { MeController } from './me.controller';
import { MeRepository } from './me.repository';
import { MeService } from './me.service';

@Module({
  imports: [AuthModule, CompanyModule, BranchModule],
  controllers: [MeController],
  providers: [MeRepository, MeService],
})
export class MeModule {}
