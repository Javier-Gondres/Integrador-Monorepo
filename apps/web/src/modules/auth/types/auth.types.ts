export type { AuthSession, AuthUser, Permission, Role } from "@/types/auth";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

/** Respuesta de GET /auth/session — construida a partir del JWT, sin contexto de empresa obligatorio. */
export interface SessionResponse {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
  companyId: string | null;
  branchId: string | null;
  role: string | null;
  permissions: string[];
}

/** Respuesta de GET /auth/profile — perfil básico global, sin contexto de empresa. */
export interface BasicProfileResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SwitchBranchResponse {
  message: string;
  branchId: string;
  accessToken: string;
}

export interface MeProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isSuperAdmin?: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  membership: {
    id: string;
    companyId: string;
    roleId: string;
    defaultBranchId: string | null;
    role: {
      id: string;
      name: string;
      permissions?: { permission: { code: string } }[];
    };
    company: { id: string; name: string; slug: string };
  } | null;
}
