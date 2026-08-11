import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthContext } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RequirePlatformAdmin } from 'src/common/platform';

import { AssignPlatformUserCompanyDto } from './dto/assign-platform-user-company.dto';
import { CreatePlatformCompanyDto } from './dto/create-platform-company.dto';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import { QueryPlatformActivationsDto } from './dto/query-platform-activations.dto';
import { QueryPlatformCompaniesDto } from './dto/query-platform-companies.dto';
import { QueryPlatformInvitationsDto } from './dto/query-platform-invitations.dto';
import { QueryPlatformUsersDto } from './dto/query-platform-users.dto';
import { TransferCompanyOwnershipDto } from './dto/transfer-company-ownership.dto';
import { UpdatePlatformCompanyDto } from './dto/update-platform-company.dto';
import { UpdatePlatformUserDto } from './dto/update-platform-user.dto';
import { UpdatePlatformUserRoleDto } from './dto/update-platform-user-role.dto';
import { UpdatePlatformUserStatusDto } from './dto/update-platform-user-status.dto';
import { PlatformService } from './platform.service';

/**
 * Administración de plataforma (SaaS).
 *
 * Protegido por `@RequirePlatformAdmin()` — sin CompanyGuard ni PermissionGuard.
 */
@Controller('platform')
@RequirePlatformAdmin()
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get('overview')
  getOverview() {
    return this.platformService.getOverview();
  }

  @Get('permissions')
  getPermissionsCatalog() {
    return this.platformService.getPermissionsCatalog();
  }

  @Get('companies')
  findAllCompanies(@Query() query: QueryPlatformCompaniesDto) {
    return this.platformService.findAllCompanies(query);
  }

  @Get('users')
  findAllUsers(@Query() query: QueryPlatformUsersDto) {
    return this.platformService.findAllUsers(query);
  }

  @Get('users/:id')
  findUserById(@Param('id') id: string) {
    return this.platformService.findUserById(id);
  }

  @Post('users')
  createUser(@Body() dto: CreatePlatformUserDto, @Auth() auth: AuthContext) {
    return this.platformService.createUser(dto, auth);
  }

  @Get('activations')
  findAllActivations(@Query() query: QueryPlatformActivationsDto) {
    return this.platformService.findAllActivations(query);
  }

  @Post('activations/:id/resend')
  resendActivation(@Param('id') id: string, @Auth() auth: AuthContext) {
    return this.platformService.resendActivation(id, auth);
  }

  @Post('activations/:id/cancel')
  cancelActivation(@Param('id') id: string, @Auth() auth: AuthContext) {
    return this.platformService.cancelActivation(id, auth);
  }

  @Get('invitations')
  findAllInvitations(@Query() query: QueryPlatformInvitationsDto) {
    return this.platformService.findAllInvitations(query);
  }

  @Post('invitations/:id/resend')
  resendInvitation(@Param('id') id: string, @Auth() auth: AuthContext) {
    return this.platformService.resendInvitation(id, auth);
  }

  @Post('invitations/:id/revoke')
  revokeInvitation(@Param('id') id: string, @Auth() auth: AuthContext) {
    return this.platformService.revokeInvitation(id, auth);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdatePlatformUserDto,
    @Auth() auth: AuthContext,
  ) {
    return this.platformService.updateUser(id, dto, auth);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePlatformUserStatusDto,
    @Auth() auth: AuthContext,
  ) {
    return this.platformService.updateUserStatus(id, dto, auth);
  }

  @Post('users/:id/force-logout')
  forceLogoutUser(@Param('id') id: string, @Auth() auth: AuthContext) {
    return this.platformService.forceLogoutUser(id, auth);
  }

  @Delete('users/:id')
  softDeleteUser(@Param('id') id: string, @Auth() auth: AuthContext) {
    return this.platformService.softDeleteUser(id, auth);
  }

  @Patch('users/:id/restore')
  restoreUser(@Param('id') id: string, @Auth() auth: AuthContext) {
    return this.platformService.restoreUser(id, auth);
  }

  @Post('users/:id/membership')
  assignUserToCompany(
    @Param('id') id: string,
    @Body() dto: AssignPlatformUserCompanyDto,
    @Auth() auth: AuthContext,
  ) {
    return this.platformService.assignUserToCompany(id, dto, auth);
  }

  @Delete('users/:id/membership')
  removeUserMembership(@Param('id') id: string, @Auth() auth: AuthContext) {
    return this.platformService.removeUserMembership(id, auth);
  }

  @Patch('users/:id/membership/role')
  updateUserMembershipRole(
    @Param('id') id: string,
    @Body() dto: UpdatePlatformUserRoleDto,
    @Auth() auth: AuthContext,
  ) {
    return this.platformService.updateUserMembershipRole(id, dto, auth);
  }

  @Post('users/:id/reset-password')
  resetUserPassword(@Param('id') id: string) {
    return this.platformService.sendUserPasswordReset(id);
  }

  @Post('users/:id/verify-email')
  verifyUserEmail(@Param('id') id: string) {
    return this.platformService.verifyUserEmail(id);
  }

  @Get('companies/:id')
  findCompanyById(@Param('id') id: string) {
    return this.platformService.findCompanyById(id);
  }

  @Post('companies')
  createCompany(@Body() dto: CreatePlatformCompanyDto) {
    return this.platformService.createCompany(dto);
  }

  @Patch('companies/:id')
  updateCompany(
    @Param('id') id: string,
    @Body() dto: UpdatePlatformCompanyDto,
    @Auth() auth: AuthContext,
  ) {
    return this.platformService.updateCompany(id, dto, auth);
  }

  @Post('companies/:id/transfer-ownership')
  transferCompanyOwnership(
    @Param('id') id: string,
    @Body() dto: TransferCompanyOwnershipDto,
    @Auth() auth: AuthContext,
  ) {
    return this.platformService.transferCompanyOwnership(id, dto, auth);
  }

  @Patch('companies/:id/activate')
  activateCompany(@Param('id') id: string) {
    return this.platformService.activateCompany(id);
  }

  @Patch('companies/:id/deactivate')
  deactivateCompany(@Param('id') id: string) {
    return this.platformService.deactivateCompany(id);
  }
}
