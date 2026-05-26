import { z } from "zod";

export const CompanyDraftSchema = z.object({
  name: z.string(),
  rnc: z.string(),
});

export const BranchSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.nullable(z.string()),
  phone: z.nullable(z.string()),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  companyId: z.string(),
});

export const BranchArraySchema = z.array(BranchSchema);

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  rnc: z.string(),
  slug: z.string(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  branches: z.array(BranchSchema),
});

export const CompanyResponseSchema = z.array(CompanySchema);
