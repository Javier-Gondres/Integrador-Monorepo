import { z } from "zod";

export const userFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email no válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  role: z.string().min(1, "Selecciona un rol"),
});

export const userUpdateFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  role: z.string().min(1, "Selecciona un rol"),
});

export type UserFormSchema = z.infer<typeof userFormSchema>;
export type UserUpdateFormSchema = z.infer<typeof userUpdateFormSchema>;
