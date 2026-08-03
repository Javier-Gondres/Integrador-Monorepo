"use client";

import { ERP_COLORS as C } from "@/constants/theme";
import { PageHeader } from "@/shared/ui";

import { PlatformCompaniesTableContainer } from "../containers/platform-companies-table-container";

export function PlatformCompaniesScreen() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Plataforma / Empresas" title="Empresas tenant" />

      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 md:p-8 md:gap-6">
        <PlatformCompaniesTableContainer />
      </div>
    </main>
  );
}
