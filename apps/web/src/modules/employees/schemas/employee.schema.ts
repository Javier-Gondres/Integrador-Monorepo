import { z } from "zod";

const optionalSalary = z.string().optional();

export const employeeFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre debe tener máximo 100 caracteres"),
  lastName: z
    .string()
    .min(1, "El apellido es requerido")
    .max(100, "El apellido debe tener máximo 100 caracteres"),
  phone: z
    .string()
    .max(20, "El teléfono debe tener máximo 20 caracteres")
    .optional(),
  email: z
    .string()
    .email("Email no válido")
    .max(100, "El email debe tener máximo 100 caracteres"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  roleId: z.string().min(1, "Selecciona un rol"),
  branchId: z.string().min(1, "La sucursal es requerida"),
  position: z
    .string()
    .max(100, "El puesto debe tener máximo 100 caracteres")
    .optional(),
  salary: optionalSalary,
  hireDate: z.string().optional(),
});

export const employeeUpdateFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre debe tener máximo 100 caracteres"),
  lastName: z
    .string()
    .min(1, "El apellido es requerido")
    .max(100, "El apellido debe tener máximo 100 caracteres"),
  phone: z
    .string()
    .max(20, "El teléfono debe tener máximo 20 caracteres")
    .optional(),
  branchId: z.string().optional(),
  roleId: z.string().optional(),
  position: z
    .string()
    .max(100, "El puesto debe tener máximo 100 caracteres")
    .optional(),
  salary: optionalSalary,
  hireDate: z.string().optional(),
});

export type EmployeeFormSchema = z.infer<typeof employeeFormSchema>;
export type EmployeeUpdateFormSchema = z.infer<typeof employeeUpdateFormSchema>;