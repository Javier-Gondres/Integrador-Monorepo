import { redirect } from "next/navigation";

import CompanyPageClient from "../../components/company/CompanyPageClient";
import { CompanyResponseSchema } from "../../src/schemas";

async function getCompanies() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/company`;
  const req = await fetch(url);

  if (!req.ok) {
    console.error("error en el request?", process.env.NEXT_PUBLIC_API_URL);
    redirect("/not-found");
  }

  const companies = CompanyResponseSchema.safeParse(await req.json());
  if (!companies.success) {
    companies.error.issues.forEach((issue) => {
      console.error("error en la validacion: ", issue.message);
    });
    return;
  }
  return companies.data;
}

export default async function page() {
  const companies = await getCompanies();
  if (!companies) {
    return <p>no hay productos</p>;
  }

  return <CompanyPageClient initialCompanies={companies} />;
}
