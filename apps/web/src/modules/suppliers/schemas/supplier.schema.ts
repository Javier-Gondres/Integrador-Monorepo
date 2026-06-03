import { z } from "zod";

export const supplierFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  contactName: z.string().optional(),
  email: z
    .string()
    .email("Email no válido")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  rnc: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

export type SupplierFormSchema = z.infer<typeof supplierFormSchema>;
