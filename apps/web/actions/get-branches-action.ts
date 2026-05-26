"use server";

import { redirect } from "next/navigation";

import { BranchArraySchema } from "../src/schemas";

export async function getBranches(slug: string) {
  const url = `${process.env.API_URL}/company/${slug}/branch`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error(
      `error en el request: ${res.status}: ${res.statusText}. Body: ${await res.json()}`,
    );
    redirect("/not-found");
  }
  const json = await res.json();
  // console.log(`url: ${url}  respuesta en json: ${json}`);

  const branches = BranchArraySchema.safeParse(json);
  if (!branches.success) {
    branches.error.issues.forEach((issue) => {
      console.error("error en validacion: ", issue.message);
    });
    return;
  }

  return branches.data;
}
