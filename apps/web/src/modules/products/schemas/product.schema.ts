import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  code: z.string().min(1, "El código es requerido"),
  description: z.string().optional(),
  price: z.number().min(0, "El precio no puede ser negativo"),
  categoryIds: z.array(z.string()),
  isActive: z.boolean(),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;

export const createProductSchema = productFormSchema;
export const updateProductSchema = productFormSchema;
