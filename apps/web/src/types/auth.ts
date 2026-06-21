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
  branchId?: string;
  role?: Role;
  permissions: string[];
}

export interface AuthSession {
  user: AuthUser;
  accessToken?: string;
}
