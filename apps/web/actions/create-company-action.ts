"use server";
import { revalidatePath } from "next/cache";

import { CompanyDraftSchema } from "../src/schemas";

export async function createCompany(data: unknown) {
  const url = `${process.env.API_URL}/company`;

  const result = CompanyDraftSchema.safeParse(data);
  if (!result.success) {
    return {
      errors: result.error.issues,
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.data),
  });

  if (!res.ok) {
    console.error("respuesta de error: ", res.json);
  }

  revalidatePath("/company");
}
