import type { TenantRoleName } from "@repo/shared";

import type { User } from "@/modules/users/types/user.types";
import { getRoleLabel } from "@/modules/users/utils/role-labels";

import type { CompanyMember } from "../types/company-member.types";
import type { Employee } from "../types/employee.types";

export function mapUsersAndEmployeesToMembers(
  users: User[],
  employees: Employee[],
): CompanyMember[] {
  const employeeByUserId = new Map(
    employees.map((employee) => [employee.userId, employee]),
  );

  return users
    .filter((user) => Boolean(user.roleName))
    .map((user) => {
      const employee = employeeByUserId.get(user.id);
      const roleName = (user.roleName ||
        employee?.roleName ||
        "") as TenantRoleName;

      return {
        userId: user.id,
        employeeId: employee?.id ?? null,
        email: user.email,
        firstName: employee?.firstName ?? user.firstName,
        lastName: employee?.lastName ?? user.lastName,
        fullName: employee?.fullName ?? user.fullName,
        roleName,
        roleId: user.roleId || employee?.roleId || "",
        roleLabel: getRoleLabel(roleName),
        isActive: user.isActive,
        branchId: employee?.branchId ?? null,
        branchName: employee?.branchName ?? null,
        defaultBranchId: user.defaultBranchId,
        joinedAt: user.joinedAt,
        position: employee?.position ?? null,
        phone: employee?.phone ?? null,
        salary: employee?.salary ?? null,
        hireDate: employee?.hireDate ?? null,
      };
    });
}
