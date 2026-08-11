import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre debe tener máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "La descripción debe tener máximo 500 caracteres")
    .optional(),
  isActive: z.boolean(),
});

export type CategoryFormSchema = z.infer<typeof categoryFormSchema>;

export const createCategorySchema = categoryFormSchema;
export const updateCategorySchema = categoryFormSchema;
