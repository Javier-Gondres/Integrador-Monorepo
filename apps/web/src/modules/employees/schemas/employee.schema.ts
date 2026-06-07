import { z } from "zod";

const optionalSalary = z.string().optional();

export const employeeFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  phone: z.string().optional(),
  email: z.string().email("Email no válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  roleId: z.string().min(1, "Selecciona un rol"),
  branchId: z.string().min(1, "La sucursal es requerida"),
  position: z.string().optional(),
  salary: optionalSalary,
  hireDate: z.string().optional(),
});

export const employeeUpdateFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  phone: z.string().optional(),
  branchId: z.string().min(1, "La sucursal es requerida"),
  position: z.string().optional(),
  salary: optionalSalary,
  hireDate: z.string().optional(),
});

export type EmployeeFormSchema = z.infer<typeof employeeFormSchema>;
export type EmployeeUpdateFormSchema = z.infer<typeof employeeUpdateFormSchema>;
