"use client";

import { ERP_COLORS as C } from "@/constants/theme";
import { PageHeader } from "@/shared/ui";

import { PlatformOverviewCards } from "../components/platform-overview-cards";

export function PlatformDashboardScreen() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Plataforma" title="Administración SaaS" />

      <div style={{ padding: "32px 40px" }}>
        <PlatformOverviewCards />
      </div>
    </main>
  );
}
