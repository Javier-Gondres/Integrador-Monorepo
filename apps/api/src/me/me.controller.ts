import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthContext } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { JwtAuth } from 'src/auth/decorators/jwt-auth.decorator';
import { CompanyId, RequireCompany } from 'src/common/company';

import { SwitchBranchDto } from './dto/switch-branch.dto';
import { SwitchCompanyDto } from './dto/switch-company.dto';
import { MeService } from './me.service';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @JwtAuth()
  @Get()
  getProfile(@Auth() auth: AuthContext) {
    return this.meService.getProfile(auth.userId);
  }

  @JwtAuth()
  @Get('companies')
  getCompanies(@Auth() auth: AuthContext) {
    return this.meService.findMyCompanies(auth.userId);
  }

  @RequireCompany()
  @Get('branches')
  getBranches(@CompanyId() companyId: string) {
    return this.meService.findMyBranches(companyId);
  }

  @JwtAuth()
  @Post('switch-company')
  switchCompany(@Auth() auth: AuthContext, @Body() dto: SwitchCompanyDto) {
    return this.meService.switchCompany(auth.userId, dto);
  }

  @RequireCompany()
  @Post('switch-branch')
  switchBranch(@Auth() auth: AuthContext, @Body() dto: SwitchBranchDto) {
    return this.meService.switchBranch(auth, dto);
  }
}
