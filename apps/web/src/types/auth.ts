import type { PermissionCode } from "@repo/shared";

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string | null;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
  companyId?: string;
  companySlug?: string;
  branchId?: string;
  role?: Role;
  permissions: PermissionCode[];
}

export interface AuthSession {
  user: AuthUser;
  accessToken?: string;
}
