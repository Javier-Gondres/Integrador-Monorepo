import {
  AccessTokenPayload,
  AuthContext,
  UserAuthContext,
} from '../auth.types';

export function toAuthContext(user: UserAuthContext): AuthContext {
  return {
    userId: user.id,
    email: user.email,
    companyId: user.membership?.companyId ?? null,
    branchId: user.membership?.defaultBranchId ?? null,
    role: user.membership?.role.name ?? null,
    permissions: user.membership?.role.permissions ?? [],
    isSuperAdmin: user.isSuperAdmin,
  };
}

export function toAuthContextFromPayload(
  payload: AccessTokenPayload,
): AuthContext {
  return {
    userId: payload.sub,
    email: payload.email ?? '',
    companyId: payload.companyId ?? null,
    branchId: payload.branchId ?? null,
    role: payload.role ?? null,
    permissions: payload.permissions ?? [],
    isSuperAdmin: payload.isSuperAdmin ?? false,
  };
}
