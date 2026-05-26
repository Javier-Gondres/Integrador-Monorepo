"use server";

import { redirect } from "next/navigation";

import { CompanySchema } from "../src/schemas";

export async function getCompany(slug: string) {
  const url = `${process.env.API_URL}/company/${slug}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error(`error en el request: ${res.status}: ${res.statusText}`);
    redirect("/not-found");
  }

  const company = CompanySchema.safeParse(await res.json());
  if (!company.success) {
    company.error.issues.forEach((issue) => {
      console.error("error en la validacion: ", issue.message);
    });
    return;
  }

  return company.data;
}
