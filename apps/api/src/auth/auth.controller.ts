import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  Company,
  type CompanyContext,
  RequireCompany,
} from 'src/common/company';

import { AuthService } from './auth.service';
import { AuthContext, RefreshGuardRequestUser } from './auth.types';
import { Auth } from './decorators/auth.decorator';
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

  @RequireCompany()
  @Get('me')
  getMe(@Auth() auth: AuthContext, @Company() company: CompanyContext) {
    return { auth, company };
  }
}
