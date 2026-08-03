import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { CompanyController } from './company.controller';
import { CompanyRepository } from './company.repository';
import { CompanyService } from './company.service';

@Module({
  imports: [AuthModule],
  controllers: [CompanyController],
  providers: [CompanyRepository, CompanyService],
  exports: [CompanyService, CompanyRepository],
})
export class CompanyModule {}
