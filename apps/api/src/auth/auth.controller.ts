import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { AuthUser, RefreshGuardRequestUser } from './auth.types';
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from './refresh-token.cookie';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
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

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(
    @Req() req: Request & { user: RefreshGuardRequestUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshTokenPayload, refreshTokenFromCookie, authenticatedUser } =
      req.user;

    const { accessToken, refreshToken } =
      await this.authService.refreshSession(
        refreshTokenPayload,
        refreshTokenFromCookie,
        authenticatedUser,
      );

    setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('logout')
  async logout(
    @Req() req: Request & { user: RefreshGuardRequestUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutSession(req.user.refreshTokenPayload);
    clearRefreshTokenCookie(res);
    return { message: 'Sesión cerrada' };
  }
}
