import type { TenantRoleName } from "@repo/shared";

import type { BaseListFilters } from "@/types/filters";

export interface EmployeeUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  memberships?: Array<{
    companyId: string;
    role: {
      id: string;
      name: string;
    };
  }>;
}

export interface EmployeeBranchDto {
  id: string;
  name: string;
  companyId: string;
}

export interface EmployeeDto {
  id: string;
  companyId: string;
  branchId: string;
  userId: string;
  phone: string | null;
  position: string | null;
  salary: string | number | null;
  hireDate: string | null;
  terminationDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branch: EmployeeBranchDto;
  user: EmployeeUserDto;
}

export interface Employee {
  id: string;
  companyId: string;
  branchId: string;
  userId: string;
  roleId: string | null;
  roleName: TenantRoleName | null;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  position: string | null;
  salary: number | null;
  salaryLabel: string | null;
  hireDate: string | null;
  terminationDate: string | null;
  isActive: boolean;
  branchName: string;
  userEmail: string;
}

export type EmployeeFilters = BaseListFilters & {
  branchId?: string;
};

export interface EmployeeFormValues {
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  password: string;
  roleId: string;
  branchId: string;
  position?: string;
  salary?: number;
  hireDate?: string;
}

export interface BranchOption {
  id: string;
  name: string;
}

export interface RoleOption {
  id: string;
  name: string;
  description: string | null;
}
