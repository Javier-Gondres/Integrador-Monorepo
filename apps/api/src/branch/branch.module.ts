import { Module } from '@nestjs/common';
import { CompanyModule } from 'src/company/company.module';

import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';

@Module({
  imports: [CompanyModule],
  controllers: [BranchController],
  providers: [BranchService],
})
export class BranchModule {}
