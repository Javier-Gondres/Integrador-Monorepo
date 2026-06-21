import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  Company,
  type CompanyContext,
  RequireCompany,
} from 'src/common/company';

import { AuthService } from './auth.service';
import { AuthContext, RefreshGuardRequestUser } from './auth.types';
import { Auth } from './decorators/auth.decorator';
import { JwtAuth } from './decorators/jwt-auth.decorator';
import { LoginDto } from './dto/login.dto/login.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from './refresh-token.cookie';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    const { accessToken, refreshToken } = await this.authService.login(user);
    setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request & { user: RefreshGuardRequestUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshTokenPayload, refreshTokenFromCookie } = req.user;

    const { accessToken, refreshToken } = await this.authService.refreshSession(
      refreshTokenPayload,
      refreshTokenFromCookie,
    );

    setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request & { user: RefreshGuardRequestUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutSession(req.user.refreshTokenPayload);
    clearRefreshTokenCookie(res);
    return { message: 'Sesión cerrada' };
  }

  /**
   * Reconstruye la sesión del usuario autenticado a partir del JWT.
   * No requiere empresa activa: válido para SuperAdmin, tenant users y usuarios
   * en proceso de onboarding.
   */
  @JwtAuth()
  @Get('session')
  getSession(@Auth() auth: AuthContext) {
    return {
      userId: auth.userId,
      email: auth.email,
      isSuperAdmin: auth.isSuperAdmin,
      companyId: auth.companyId,
      branchId: auth.branchId,
      role: auth.role,
      permissions: auth.permissions,
    };
  }

  /**
   * Perfil básico global desde BD. No requiere empresa activa.
   * Complementa GET /auth/session con datos que no viajan en el JWT.
   */
  @JwtAuth()
  @Get('profile')
  getProfile(@Auth() auth: AuthContext) {
    return this.authService.getBasicProfile(auth.userId);
  }

  @RequireCompany()
  @Get('me')
  getMe(@Auth() auth: AuthContext, @Company() company: CompanyContext) {
    return { auth, company };
  }
}
