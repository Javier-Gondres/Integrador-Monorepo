import type { TenantRoleName } from "@repo/shared";

export type CompanyMember = {
  userId: string;
  employeeId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roleName: TenantRoleName;
  roleId: string;
  roleLabel: string;
  isActive: boolean;
  branchId: string | null;
  branchName: string | null;
  defaultBranchId: string | null;
  joinedAt: string | null;
  position: string | null;
  phone: string | null;
  salary: number | null;
  hireDate: string | null;
};
