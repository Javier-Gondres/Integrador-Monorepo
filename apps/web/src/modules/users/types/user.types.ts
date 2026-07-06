import type { BaseListFilters } from "@/types/filters";

export interface UserRoleDto {
  id: string;
  name: string;
  description: string | null;
}

export interface UserMembershipDto {
  id: string;
  companyId: string;
  roleId: string;
  defaultBranchId: string | null;
  role: UserRoleDto;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  membership: UserMembershipDto | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roleName: string;
  roleLabel: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

export interface UserFilters extends BaseListFilters {
  role?: string;
}

export interface RoleOption {
  id: string;
  name: string;
  description: string | null;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface UsersApiPage {
  items: UserDto[];
  meta: {
    page: number;
    take: number;
    total: number;
    totalPages: number;
  };
}
