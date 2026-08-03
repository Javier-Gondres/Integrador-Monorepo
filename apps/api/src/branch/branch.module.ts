import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { BranchController } from './branch.controller';
import { BranchRepository } from './branch.repository';
import { BranchService } from './branch.service';
import { BranchAccessService } from './branch-access.service';

@Module({
  imports: [AuthModule],
  controllers: [BranchController],
  providers: [BranchRepository, BranchService, BranchAccessService],
  exports: [BranchService, BranchRepository, BranchAccessService],
})
export class BranchModule {}
