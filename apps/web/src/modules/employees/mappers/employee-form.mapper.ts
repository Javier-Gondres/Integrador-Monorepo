import type {
  EmployeeFormSchema,
  EmployeeUpdateFormSchema,
} from "../schemas/employee.schema";
import type { Employee, EmployeeFormValues } from "../types/employee.types";

function parseOptionalSalary(value?: string): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

export function mapEmployeeToCreateFormValues(): EmployeeFormSchema {
  return {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    roleId: "",
    branchId: "",
    position: "",
    salary: "",
    hireDate: "",
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
    salary: employee?.salary != null ? String(employee.salary) : "",
    hireDate: employee?.hireDate?.slice(0, 10) ?? "",
    branchId: employee?.branchId ?? "",
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
    hireDate: values.hireDate || undefined,
  };
}

export function mapUpdateFormValuesToDto(values: EmployeeUpdateFormSchema) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone || undefined,
    position: values.position || undefined,
    salary: parseOptionalSalary(values.salary),
    hireDate: values.hireDate || undefined,
    branchId: values.branchId,
  };
}
