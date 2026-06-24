import { z } from "zod";

export const inventoryFormSchema = z.object({
  productId: z.string().min(1, "El producto es requerido"),
  quantity: z.number().min(0, "La cantidad no puede ser negativa"),
  minimumQuantity: z
    .number()
    .min(0, "La cantidad mínima no puede ser negativa"),
});

export type InventoryFormSchema = z.infer<typeof inventoryFormSchema>;
