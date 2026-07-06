import { RoleName } from '@repo/db';
import type { PermissionCode } from '@repo/shared';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  companyId: string | null;
  branchId: string | null;
  role: RoleName | null;
  permissions: PermissionCode[];
  isSuperAdmin: boolean;
};

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
  email: string;
  companyId: string | null;
  branchId: string | null;
  role: RoleName | null;
  permissions: PermissionCode[];
  isSuperAdmin: boolean;
};

/** Perfil básico global: no requiere empresa activa. */
export type BasicUserProfile = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type UserAuthContext = {
  id: string;
  email: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  membership: {
    companyId: string;
    defaultBranchId: string | null;
    role: { name: RoleName; permissions: PermissionCode[] };
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
