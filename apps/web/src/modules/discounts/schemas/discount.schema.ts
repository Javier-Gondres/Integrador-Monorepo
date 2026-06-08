import { z } from "zod";

export const discountFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  percentage: z
    .number()
    .min(0, "El porcentaje no puede ser menor que 0")
    .max(100, "El porcentaje no puede ser mayor que 100"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  productIds: z.array(z.string()),
  categoryIds: z.array(z.string()),
  excludedProductIds: z.array(z.string()),
  isActive: z.boolean(),
});

export type DiscountFormSchema = z.infer<typeof discountFormSchema>;

export const createDiscountSchema = discountFormSchema;
export const updateDiscountSchema = discountFormSchema;
