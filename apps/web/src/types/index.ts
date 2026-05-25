import { Company } from "@repo/db";

export type DraftCompany = Pick<Company, "name" | "rnc">;
