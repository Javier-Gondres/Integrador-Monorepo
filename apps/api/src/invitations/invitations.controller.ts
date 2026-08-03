import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Permission } from '@repo/shared';

import { AuthContext } from '../auth/auth.types';
import { Auth } from '../auth/decorators/auth.decorator';
import { JwtAuth } from '../auth/decorators/jwt-auth.decorator';
import { CompanyId } from '../common/company';
import { RequirePermissions } from '../common/permissions';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { RegisterInvitationDto } from './dto/register-invitation.dto';
import { InvitationsService } from './invitations.service';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @RequirePermissions(Permission.INVITATIONS_READ)
  @Get()
  findAll(@CompanyId() companyId: string) {
    return this.invitationsService.findAll(companyId);
  }

  @Get(':token')
  findByToken(@Param('token') token: string) {
    return this.invitationsService.findByToken(token);
  }

  @RequirePermissions(Permission.INVITATIONS_CREATE)
  @Post()
  create(
    @Auth() auth: AuthContext,
    @CompanyId() companyId: string,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationsService.create(auth, companyId, dto);
  }

  @JwtAuth()
  @Post(':token/accept')
  accept(@Param('token') token: string, @Auth() auth: AuthContext) {
    return this.invitationsService.accept(token, auth);
  }

  @Post(':token/register')
  register(@Param('token') token: string, @Body() dto: RegisterInvitationDto) {
    return this.invitationsService.register(token, dto);
  }

  @RequirePermissions(Permission.INVITATIONS_RESEND)
  @Post(':id/resend')
  resend(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.invitationsService.resend(id, companyId);
  }

  @RequirePermissions(Permission.INVITATIONS_REVOKE)
  @Post(':id/revoke')
  revoke(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.invitationsService.revoke(id, companyId);
  }
}
