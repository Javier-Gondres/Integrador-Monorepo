"use client";

import { useEffect, useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { useBranches } from "@/modules/branches/hooks/use-branches";
import { PageHeader } from "@/shared/ui";

import { AdjustmentFormModalContainer } from "../containers/adjustment-form-modal-container";
import { AdjustmentsTableContainer } from "../containers/adjustments-table-container";

export function InventoryAdjustmentsScreen() {
  const { user } = useAuth();
  const { data: branches, isLoading: branchesLoading } = useBranches();

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <PageHeader breadcrumb="Ajustes" title="Ajustes de inventario" />

      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <AdjustmentsTableContainer
          branchId={selectedBranchId}
          branches={branches ?? []}
          branchesLoading={branchesLoading}
          onBranchChange={setSelectedBranchId}
          onCreate={() => setIsModalOpen(true)}
        />
      </div>

      {isModalOpen && selectedBranchId && (
        <AdjustmentFormModalContainer
          defaultBranchId={selectedBranchId}
          branches={branches ?? []}
          branchesLoading={branchesLoading}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </main>
  );
}
