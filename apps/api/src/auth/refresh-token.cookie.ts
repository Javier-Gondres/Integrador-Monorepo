import type { CookieOptions, Response } from 'express';

export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function resolveSameSite(): CookieOptions['sameSite'] {
  const fromEnv = process.env.COOKIE_SAME_SITE;
  if (fromEnv === 'lax' || fromEnv === 'strict' || fromEnv === 'none') {
    return fromEnv;
  }

  return 'none';
}

export function refreshTokenCookieOptions(): CookieOptions {
  const sameSite = resolveSameSite();

  return {
    httpOnly: true,
    secure: sameSite === 'none' || process.env.COOKIE_SECURE === 'true',
    sameSite,
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  };
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, refreshTokenCookieOptions());
}

export function clearRefreshTokenCookie(res: Response): void {
  const { httpOnly, secure, sameSite, path } = refreshTokenCookieOptions();
  res.clearCookie(REFRESH_TOKEN_COOKIE, { httpOnly, secure, sameSite, path });
}
