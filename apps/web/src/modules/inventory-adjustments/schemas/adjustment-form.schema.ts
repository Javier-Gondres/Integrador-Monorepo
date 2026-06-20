import { z } from "zod";

export const adjustmentFormSchema = z.object({
  branchId: z.string().min(1, "La sucursal es requerida"),
  productId: z.string().min(1, "El producto es requerido"),
  quantity: z
    .number()
    .refine((value) => value !== 0, "La cantidad no puede ser 0"),
  adjustmentReason: z.enum(["COUNT_DIFFERENCE", "OTHER"], {
    message: "La razón de ajuste es requerida",
  }),
  notes: z.string().optional(),
});

export type AdjustmentFormSchema = z.infer<typeof adjustmentFormSchema>;
