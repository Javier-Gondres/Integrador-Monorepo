import { z } from "zod";

const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().optional());

const optionalEmail = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().email("El correo no tiene un formato válido").optional());

const optionalPhone = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const digits = value.replace(/\D/g, "");
    return digits === "" ? undefined : digits;
  },
  z
    .string()
    .regex(/^[0-9]{10}$/, "El teléfono debe tener 10 dígitos")
    .optional(),
);

const optionalCedula = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const digits = value.replace(/\D/g, "");
    return digits === "" ? undefined : digits;
  },
  z
    .string()
    .regex(/^[0-9]{11}$/, "La cédula debe tener 11 dígitos")
    .optional(),
);

export const customerFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "El nombre es requerido")
    .regex(namePattern, "El nombre solo puede contener letras y espacios"),
  lastName: z
    .string()
    .trim()
    .min(1, "El apellido es requerido")
    .regex(namePattern, "El apellido solo puede contener letras y espacios"),
  email: optionalEmail,
  phone: optionalPhone,
  address: optionalTrimmedString,
  cedula: optionalCedula,
  isActive: z.boolean(),
});

export type CustomerFormSchema = z.infer<typeof customerFormSchema>;

export const createCustomerSchema = customerFormSchema;
export const updateCustomerSchema = customerFormSchema;
