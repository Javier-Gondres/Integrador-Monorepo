"use client";

import { useEffect, useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { useOperationalBranches } from "@/shared/hooks/use-operational-branches";
import { PageHeader } from "@/shared/ui";

import { InventoriesTableContainer } from "../containers/inventories-table-container";
import { InventoryFormModalContainer } from "../containers/inventory-form-modal-container";
import type { Inventory } from "../types/inventory.types";

export function InventoriesScreen() {
  const { user } = useAuth();

  const {
    branches,
    defaultBranchId,
    isLoading: branchesLoading,
  } = useOperationalBranches();

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const [modalInventory, setModalInventory] = useState<
    Inventory | null | undefined
  >(undefined);

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
      <PageHeader breadcrumb="Inventario" title="Inventario" />

      <div
        style={{
          padding: "32px 40px",

          display: "flex",

          flexDirection: "column",

          gap: "20px",
        }}
      >
        <InventoriesTableContainer
          branchId={selectedBranchId}
          branches={branches}
          branchesLoading={branchesLoading}
          onBranchChange={setSelectedBranchId}
          onEdit={setModalInventory}
          onCreate={() => setModalInventory(null)}
        />
      </div>

      {modalInventory !== undefined && selectedBranchId && (
        <InventoryFormModalContainer
          inventory={modalInventory}
          branchId={selectedBranchId}
          onClose={() => setModalInventory(undefined)}
        />
      )}
    </main>
  );
}
