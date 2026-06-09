export type { AuthSession, AuthUser, Permission, Role } from "@/types/auth";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface MeProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  membership: {
    id: string;
    companyId: string;
    roleId: string;
    defaultBranchId: string | null;
    role: { id: string; name: string };
    company: { id: string; name: string; slug: string };
  } | null;
}
