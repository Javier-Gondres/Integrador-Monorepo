import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CompanyGuard } from '../common/company/guards/company.guard';
import { CompanyOwnerOrPlatformAdminGuard } from '../common/company/guards/company-owner-or-platform-admin.guard';
import { CompanyStatusRepository } from '../common/company/company-status.repository';
import { PermissionGuard } from '../common/permissions/guards/permission.guard';
import { PlatformAdminGuard } from '../common/platform/guards/platform-admin.guard';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
@Module({
  controllers: [AuthController],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [
    AuthRepository,
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    CompanyStatusRepository,
    CompanyGuard,
    CompanyOwnerOrPlatformAdminGuard,
    PermissionGuard,
    PlatformAdminGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    CompanyStatusRepository,
    CompanyGuard,
    CompanyOwnerOrPlatformAdminGuard,
    PermissionGuard,
    PlatformAdminGuard,
  ],
})
export class AuthModule {}
