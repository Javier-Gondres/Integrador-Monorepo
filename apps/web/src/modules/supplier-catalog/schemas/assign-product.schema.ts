import { z } from "zod";

export const assignProductSchema = z.object({
  productId: z.string().min(1, "Selecciona un producto"),
  lastCost: z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined ||
        v.trim() === "" ||
        (!Number.isNaN(Number(v)) && Number(v) >= 0),
      "El costo debe ser un número válido (≥ 0)",
    ),
});

export type AssignProductSchema = z.infer<typeof assignProductSchema>;
