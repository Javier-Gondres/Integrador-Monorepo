import { AuthContext, UserAuthContext } from '../auth.types';

export function toAuthContext(user: UserAuthContext): AuthContext {
  return {
    userId: user.id,
    companyId: user.membership?.companyId ?? null,
    branchId: user.membership?.defaultBranchId ?? null,
    role: user.membership?.role.name ?? null,
    // TODO: implementar RBAC/permissions
  };
}
