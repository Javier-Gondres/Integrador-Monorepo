export type { AuthSession, AuthUser, Permission, Role } from "@/types/auth";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface AuthMeResponse {
  auth: {
    userId: string;
    companyId: string | null;
    branchId: string | null;
    role: string | null;
  };
  company: {
    companyId: string;
    branchId: string | null;
    role: string;
  };
}
