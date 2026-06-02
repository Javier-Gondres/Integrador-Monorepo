import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { BranchController } from './branch.controller';
import { BranchRepository } from './branch.repository';
import { BranchService } from './branch.service';

@Module({
  imports: [AuthModule],
  controllers: [BranchController],
  providers: [BranchRepository, BranchService],
  exports: [BranchService, BranchRepository],
})
export class BranchModule {}
