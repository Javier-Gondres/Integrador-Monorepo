"use client";

import { useEffect, useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { useOperationalBranches } from "@/shared/hooks/use-operational-branches";
import { PageHeader } from "@/shared/ui";

import { InventoryMovementsTableContainer } from "../containers/inventory-movements-table-container";

export function InventoryMovementsScreen() {
  const { user } = useAuth();

  const {
    branches,
    defaultBranchId,
    isLoading: branchesLoading,
  } = useOperationalBranches();

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedBranchId) return;

    const fallback =
      user?.branchId ?? defaultBranchId ?? branches[0]?.id ?? null;

    if (fallback) setSelectedBranchId(fallback);
  }, [user?.branchId, defaultBranchId, branches, selectedBranchId]);

  return (
    <main
      style={{
        minHeight: "100vh",

        backgroundColor: C.pageBg,

        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Movimientos" title="Movimientos de inventario" />

      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 md:p-8 md:gap-6">
        <InventoryMovementsTableContainer
          branchId={selectedBranchId}
          branches={branches}
          branchesLoading={branchesLoading}
          onBranchChange={setSelectedBranchId}
        />
      </div>
    </main>
  );
}
