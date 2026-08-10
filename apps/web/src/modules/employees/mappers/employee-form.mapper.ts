import type {
  EmployeeFormSchema,
  EmployeeUpdateFormSchema,
} from "../schemas/employee.schema";
import type { CompanyMember } from "../types/company-member.types";
import type {
  BranchOption,
  Employee,
  EmployeeFormValues,
} from "../types/employee.types";

function parseOptionalSalary(value?: string): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

function resolveDefaultBranchId(
  member: CompanyMember,
  branches: BranchOption[] = [],
): string {
  return member.branchId ?? member.defaultBranchId ?? branches[0]?.id ?? "";
}

export function mapEmployeeToCreateFormValues(
  branches: BranchOption[] = [],
): EmployeeFormSchema {
  return {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    roleId: "",
    branchId: branches[0]?.id ?? "",
    position: "",
    salary: "",
    hireDate: "",
  };
}

export function mapMemberToUpdateFormValues(
  member: CompanyMember,
  branches: BranchOption[] = [],
): EmployeeUpdateFormSchema {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    phone: member.phone ?? "",
    position: member.position ?? "",
    salary: member.salary !== null ? String(member.salary) : "",
    branchId: resolveDefaultBranchId(member, branches),
    roleId: member.roleId,
  };
}

export function mapEmployeeToUpdateFormValues(
  employee: Employee | null,
): EmployeeUpdateFormSchema {
  return {
    firstName: employee?.firstName ?? "",
    lastName: employee?.lastName ?? "",
    phone: employee?.phone ?? "",
    position: employee?.position ?? "",
    salary: employee && employee.salary !== null ? String(employee.salary) : "",
    branchId: employee?.branchId ?? "",
    roleId: employee?.roleId ?? "",
  };
}

export function mapCreateFormValuesToDto(
  values: EmployeeFormSchema,
): EmployeeFormValues {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone || undefined,
    email: values.email,
    password: values.password,
    roleId: values.roleId,
    branchId: values.branchId,
    position: values.position || undefined,
    salary: parseOptionalSalary(values.salary),
  };
}

export function mapUpdateFormValuesToDto(values: EmployeeUpdateFormSchema) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone || undefined,
    position: values.position || undefined,
    salary: parseOptionalSalary(values.salary),
    ...(values.branchId ? { branchId: values.branchId } : {}),
    ...(values.roleId ? { roleId: values.roleId } : {}),
  };
}

export function resolveMemberJoinDate(member: CompanyMember): string | null {
  return member.hireDate ?? member.joinedAt;
}

export function formatMemberJoinDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-DO", { dateStyle: "medium" }).format(
    new Date(value),
  );
}
