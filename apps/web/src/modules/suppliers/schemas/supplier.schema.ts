import { z } from "zod";

const optionalPhone = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const digits = value.replace(/\D/g, "");
    return digits === "" ? undefined : digits;
  },
  z
    .string()
    .regex(/^[0-9]{10}$/, "El teléfono debe tener 10 dígitos (ej: 8091234567)")
    .optional(),
);

const optionalRnc = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const digits = value.replace(/\D/g, "");
    return digits === "" ? undefined : digits;
  },
  z
    .string()
    .regex(
      /^[0-9]{9}$|^[0-9]{11}$/,
      "El RNC debe tener 9 dígitos (jurídico) u 11 dígitos (físico/cédula)",
    )
    .optional(),
);

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
  phone: optionalPhone,
  rnc: optionalRnc,
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
