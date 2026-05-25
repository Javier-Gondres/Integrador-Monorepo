"use server";
import { revalidatePath } from "next/cache";

import { CompanyDraftSchema } from "../src/schemas";

export async function updateCompany(data: unknown, slug: string) {
  const url = `${process.env.API_URL}/company/${slug}`;

  const result = CompanyDraftSchema.safeParse(data);
  if (!result.success) {
    return {
      errors: result.error.issues,
    };
  }

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.data),
  });

  if (!res.ok) {
    console.error("respuesta de error: ", res.json);
  }

  revalidatePath("/company");
}
