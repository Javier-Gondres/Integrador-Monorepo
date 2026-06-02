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
  permissions: Permission[];
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  companyId?: string;
  branchId?: string;
  role?: Role;
}

export interface AuthSession {
  user: AuthUser;
  accessToken?: string;
}
