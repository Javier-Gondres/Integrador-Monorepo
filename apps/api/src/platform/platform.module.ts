import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from 'src/email/email.module';
import { InvitationsModule } from 'src/invitations/invitations.module';

import { PlatformController } from './platform.controller';
import { PlatformRepository } from './platform.repository';
import { PlatformService } from './platform.service';

@Module({
  imports: [AuthModule, EmailModule, InvitationsModule],
  controllers: [PlatformController],
  providers: [PlatformRepository, PlatformService],
})
export class PlatformModule {}
