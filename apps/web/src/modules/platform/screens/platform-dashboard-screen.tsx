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

      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 md:p-8 md:gap-6">
        <PlatformOverviewCards />
      </div>
    </main>
  );
}
