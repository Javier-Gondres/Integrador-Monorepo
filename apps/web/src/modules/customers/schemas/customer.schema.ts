import { z } from "zod";

export const customerFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  cedula: z.string().optional(),
  isActive: z.boolean(),
});

export type CustomerFormSchema = z.infer<typeof customerFormSchema>;

export const createCustomerSchema = customerFormSchema;
export const updateCustomerSchema = customerFormSchema;
