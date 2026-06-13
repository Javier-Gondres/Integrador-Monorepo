"use client";

import { useEffect, useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { useCurrentUser } from "@/modules/auth/hooks/use-auth";
import { useBranches } from "@/modules/branches/hooks/use-branches";
import { PageHeader } from "@/shared/ui";

import { InventoryMovementsTableContainer } from "../containers/inventory-movements-table-container";

export function InventoryMovementsScreen() {
  const { user } = useCurrentUser();
  const { data: branches, isLoading: branchesLoading } = useBranches();

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Sucursal inicial: la activa del usuario, o la primera disponible.
  useEffect(() => {
    if (selectedBranchId) return;
    const fallback = user?.branchId ?? branches?.[0]?.id ?? null;
    if (fallback) setSelectedBranchId(fallback);
  }, [user?.branchId, branches, selectedBranchId]);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Movimientos" title="Movimientos de inventario" />

      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <InventoryMovementsTableContainer
          branchId={selectedBranchId}
          branches={branches ?? []}
          branchesLoading={branchesLoading}
          onBranchChange={setSelectedBranchId}
        />
      </div>
    </main>
  );
}
