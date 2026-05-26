import React from "react";

import { getBranches } from "../../../../actions/get-branches-action";
import { getCompany } from "../../../../actions/get-company-action";
import BranchPageClient from "../../../../components/branch/BranchPageClient";

export default async function page({ params }: { params: { slug: string } }) {
  const awaited_params = await params;
  const company = await getCompany(awaited_params.slug);
  const branches = await getBranches(awaited_params.slug);

  if (!branches || !company) {
    return <p>no hay nada</p>;
  }

  return (
    <BranchPageClient initialBranches={branches} parentCompany={company} />
  );
}
