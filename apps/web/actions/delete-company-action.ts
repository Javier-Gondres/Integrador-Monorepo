"use server";
import { revalidatePath } from "next/cache";

export async function deleteCompany(slug: string) {
  const url = `${process.env.API_URL}/company/${slug}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    console.error("respuesta de error: ", res.json);
  }

  revalidatePath("/company");
}
