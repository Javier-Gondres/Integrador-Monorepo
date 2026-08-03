import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { AuthContext } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { JwtAuth } from 'src/auth/decorators/jwt-auth.decorator';
import { CompanyId, RequireCompany } from 'src/common/company';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';
import { UpdateMeDto } from 'src/users/dto/update-me.dto';

import { SwitchBranchDto } from './dto/switch-branch.dto';
import { MeService } from './me.service';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @RequireCompany()
  @Get()
  getProfile(@Auth() auth: AuthContext, @CompanyId() companyId: string) {
    return this.meService.getProfile(auth.userId, companyId);
  }

  @RequireCompany()
  @Patch()
  updateProfile(
    @Auth() auth: AuthContext,
    @CompanyId() companyId: string,
    @Body() dto: UpdateMeDto,
  ) {
    return this.meService.updateProfile(auth.userId, companyId, dto);
  }

  @JwtAuth()
  @Patch('password')
  changePassword(@Auth() auth: AuthContext, @Body() dto: ChangePasswordDto) {
    return this.meService.changePassword(auth.userId, dto);
  }

  @JwtAuth()
  @Get('company')
  getCompany(@Auth() auth: AuthContext) {
    return this.meService.findMyCompany(auth.userId);
  }

  @RequireCompany()
  @Get('branch')
  getBranch(@Auth() auth: AuthContext) {
    return this.meService.findMyBranch(auth);
  }

  @RequireCompany()
  @Post('switch-branch')
  switchBranch(@Auth() auth: AuthContext, @Body() dto: SwitchBranchDto) {
    return this.meService.switchBranch(auth, dto);
  }
}
