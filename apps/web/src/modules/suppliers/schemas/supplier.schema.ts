import { z } from "zod";

export const supplierFormSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre debe tener máximo 100 caracteres"),
  contactName: z
    .string()
    .max(100, "El nombre del contacto debe tener máximo 100 caracteres")
    .optional(),
  email: z
    .string()
    .email("Email no válido")
    .max(100, "El email debe tener máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  // El Controller del formulario ya normaliza a solo dígitos antes de guardar en el form state
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10}$/.test(val),
      "El teléfono debe tener 10 dígitos (ej: 8091234567)",
    ),
  // RNC jurídico: 9 dígitos | RNC físico/cédula: 11 dígitos
  rnc: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{9}$/.test(val) || /^[0-9]{11}$/.test(val),
      "El RNC debe tener 9 dígitos (jurídico) u 11 dígitos (físico/cédula)",
    ),
  address: z
    .string()
    .max(250, "La dirección debe tener máximo 250 caracteres")
    .optional(),
  notes: z
    .string()
    .max(500, "Las notas deben tener máximo 500 caracteres")
    .optional(),
  isActive: z.boolean(),
});

export type SupplierFormSchema = z.infer<typeof supplierFormSchema>;
