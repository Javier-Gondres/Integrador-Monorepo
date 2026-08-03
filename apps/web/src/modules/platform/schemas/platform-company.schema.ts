import { z } from "zod";

export const platformCompanyFormSchema = z.object({
  name: z.string().min(1, "El nombre de la empresa es requerido"),
  rnc: z.string().optional(),
  ownerEmail: z.string().email("Email del owner no válido"),
  ownerPassword: z.string().min(8, "Mínimo 8 caracteres"),
  ownerFirstName: z.string().min(1, "El nombre del owner es requerido"),
  ownerLastName: z.string().min(1, "El apellido del owner es requerido"),
});

export type PlatformCompanyFormSchema = z.infer<
  typeof platformCompanyFormSchema
>;
