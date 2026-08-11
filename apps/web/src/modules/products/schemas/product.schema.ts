import { z } from "zod";

export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre debe tener máximo 100 caracteres"),
  code: z
    .string()
    .min(1, "El código es requerido")
    .max(30, "El código debe tener máximo 30 caracteres"),
  description: z
    .string()
    .max(500, "La descripción debe tener máximo 500 caracteres")
    .optional(),
  price: z.number().min(0, "El precio no puede ser negativo"),
  categoryIds: z.array(z.string()),
  isActive: z.boolean(),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;

export const createProductSchema = productFormSchema;
export const updateProductSchema = productFormSchema;
