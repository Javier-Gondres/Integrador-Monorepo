import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { PlatformController } from './platform.controller';
import { PlatformRepository } from './platform.repository';
import { PlatformService } from './platform.service';

@Module({
  imports: [AuthModule],
  controllers: [PlatformController],
  providers: [PlatformRepository, PlatformService],
})
export class PlatformModule {}
