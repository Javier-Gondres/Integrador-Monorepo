import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export type CategoryFormSchema = z.infer<typeof categoryFormSchema>;

export const createCategorySchema = categoryFormSchema;
export const updateCategorySchema = categoryFormSchema;
