import { z } from "zod";

export const registerReturnSchema = z
  .object({
    reason: z.enum(["DEFECTIVE", "SALES_ERROR", "EXPIRED", "OTHER"], {
      message: "Selecciona un motivo",
    }),
    notes: z.string().optional(),
    lineItems: z.array(
      z.object({
        productId: z.string(),
        quantityToReturn: z
          .number({ message: "Cantidad inválida" })
          .min(0, "No puede ser negativo"),
      }),
    ),
  })
  .refine(
    (values) => values.lineItems.some((item) => item.quantityToReturn > 0),
    {
      message: "Indica la cantidad a devolver de al menos un producto",
      path: ["lineItems"],
    },
  );

export type RegisterReturnSchema = z.infer<typeof registerReturnSchema>;
