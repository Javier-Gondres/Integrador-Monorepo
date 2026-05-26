import { RoleName } from '@repo/db';

export type AccessTokenPayload = { sub: string };

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthContext = {
  userId: string;
  companyId: string | null;
  branchId: string | null;

  role: RoleName | null;
  // TODO: cargar permisos dinámicos aquí (ej. permissions: string[])
};

export type UserAuthContext = {
  id: string;
  email: string;
  isActive: boolean;
  membership: {
    companyId: string;
    defaultBranchId: string | null;
    role: { name: RoleName };
  } | null;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  membership: {
    companyId: string;
    defaultBranchId: string | null;
    role: { name: RoleName };
  } | null;
};

export type RefreshGuardRequestUser = {
  refreshTokenPayload: RefreshTokenPayload;
  refreshTokenFromCookie: string;
};
