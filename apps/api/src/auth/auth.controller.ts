import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { AuthContext, AuthUser, RefreshGuardRequestUser } from './auth.types';
import { Auth } from './decorators/auth.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from './refresh-token.cookie';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request & { user: AuthUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Auth() auth: AuthContext) {
    return auth;
  }
}
