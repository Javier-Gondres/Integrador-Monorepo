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

      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <PlatformCompaniesTableContainer />
      </div>
    </main>
  );
}
