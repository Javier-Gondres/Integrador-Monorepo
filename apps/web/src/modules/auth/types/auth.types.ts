export type {
  AuthSession,
  AuthUser,
  Permission,
  Role,
} from "@/types/auth";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: import("@/types/auth").AuthUser;
  accessToken?: string;
}
