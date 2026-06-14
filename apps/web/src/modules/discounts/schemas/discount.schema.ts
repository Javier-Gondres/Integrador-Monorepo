import { endOfDay, isBefore, parseISO, startOfDay, startOfToday } from "date-fns";
import { z } from "zod";

export const discountFormSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional(),
    percentage: z
      .number({ error: "El porcentaje es requerido" })
      .min(0, "El porcentaje no puede ser menor que 0")
      .max(100, "El porcentaje no puede ser mayor que 100"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    productIds: z.array(z.string()),
    categoryIds: z.array(z.string()),
    excludedProductIds: z.array(z.string()),
    isActive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const today = startOfToday();
    const startDate = values.startDate
      ? startOfDay(parseISO(values.startDate))
      : null;
    const endDate = values.endDate
      ? endOfDay(parseISO(values.endDate))
      : null;

    if (startDate && isBefore(startDate, today)) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "La fecha de inicio no puede estar en el pasado",
      });
    }

    if (endDate && isBefore(endDate, today)) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "La fecha de cierre no puede estar en el pasado",
      });
    }

    if (startDate && endDate && startDate > endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "La fecha fin no puede ser menor que la fecha de inicio",
      });
    }

    if (values.productIds.length === 0 && values.categoryIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["productIds"],
        message: "Selecciona al menos un producto o una categoría",
      });
    }

    if (
      values.excludedProductIds.length > 0 &&
      values.categoryIds.length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["excludedProductIds"],
        message:
          "Las exclusiones solo aplican cuando hay categorías seleccionadas",
      });
    }

    const applicableSet = new Set(values.productIds);
    const overlapping = values.excludedProductIds.filter((id) =>
      applicableSet.has(id),
    );
    if (overlapping.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["excludedProductIds"],
        message:
          "Un producto no puede estar a la vez en el alcance y en las exclusiones",
      });
    }
  });

export type DiscountFormSchema = z.infer<typeof discountFormSchema>;

export const createDiscountSchema = discountFormSchema;
export const updateDiscountSchema = discountFormSchema;
