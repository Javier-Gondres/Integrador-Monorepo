import type { PaginatedResponse } from "@/types/pagination";

import type { Employee, EmployeeDto } from "../types/employee.types";
import { resolveEmployeeRoleName } from "../utils/employee-access";

function formatSalary(
  value: string | number | null | undefined,
): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) {
    return String(value);
  }
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
  }).format(num);
}

function parseSalary(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(num) ? null : num;
}

export function mapEmployeeDtoToUi(dto: EmployeeDto): Employee {
  const memberships = dto.user.memberships ?? [];

  return {
    id: dto.id,
    companyId: dto.companyId,
    branchId: dto.branchId,
    userId: dto.userId,
    roleName: resolveEmployeeRoleName(dto.companyId, memberships),
    firstName: dto.user.firstName,
    lastName: dto.user.lastName,
    fullName: `${dto.user.firstName} ${dto.user.lastName}`.trim(),
    phone: dto.phone,
    position: dto.position,
    salary: parseSalary(dto.salary),
    salaryLabel: formatSalary(dto.salary),
    hireDate: dto.hireDate,
    terminationDate: dto.terminationDate,
    isActive: dto.isActive,
    branchName: dto.branch.name,
    userEmail: dto.user.email,
  };
}

export function mapEmployeesPageToUi(
  response: PaginatedResponse<EmployeeDto>,
): PaginatedResponse<Employee> {
  return {
    items: response.items.map(mapEmployeeDtoToUi),
    meta: response.meta,
  };
}
