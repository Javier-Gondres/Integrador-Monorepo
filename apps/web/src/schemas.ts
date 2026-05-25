import { z } from "zod";

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  rnc: z.string(),
  slug: z.string(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export const CompanyDraftSchema = z.object({
  name: z.string(),
  rnc: z.string(),
});

export const CompanyResponseSchema = z.array(CompanySchema);
