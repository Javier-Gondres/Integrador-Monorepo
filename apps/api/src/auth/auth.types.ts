import { UserMembership } from 'src/users/users.service';

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  membership: UserMembership | null;
};

export type AccessTokenPayload = {
  sub: string;
  companyId: string;
  role: string;
  branchId: string | null;
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

/** Objeto que deja `JwtStrategy` en `req.user`. */
export type JwtGuardRequestUser = {
  userId: string;
  companyId: string;
  role: string;
  branchId: string | null;
};

/** Objeto que deja `JwtRefreshStrategy` en `req.user`. */
export type RefreshGuardRequestUser = {
  refreshTokenPayload: RefreshTokenPayload;
  refreshTokenFromCookie: string;
  authenticatedUser: AuthUser;
};
