import { z } from "zod";

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  rnc: z.string(),
});
export const CompanyDraftSchema = z.object({
  name: z.string(),
  rnc: z.string(),
});

export const CompanyResponseSchema = z.array(CompanySchema);
