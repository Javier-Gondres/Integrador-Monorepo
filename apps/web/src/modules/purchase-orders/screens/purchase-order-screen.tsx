"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Permission } from "@/modules/auth";
import { BranchSelect } from "@/modules/branches/components/branch-select";
import { useOperationalBranches } from "@/shared/hooks/use-operational-branches";
import { Can } from "@/shared/ui/can";

import { PurchaseOrderContainer } from "../containers/purchase-order-container";

export function PurchaseOrderScreen() {
  const {
    branches,
    canSelectBranch,
    defaultBranchId,
    isLoading: branchesLoading,
  } = useOperationalBranches();

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  useEffect(() => {
    if (defaultBranchId && (!selectedBranchId || !canSelectBranch)) {
      setSelectedBranchId(defaultBranchId);
    }
  }, [defaultBranchId, selectedBranchId, canSelectBranch]);

  return (
    <main className="min-h-screen bg-page">
      <div className="border-b border-card-border bg-card px-4 py-4 sm:px-6 sm:py-5 md:px-10">
        <Link
          href="/purchase-history"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-head transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al historial
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[13px] text-muted">
              Panel / Compras /{" "}
              <span className="text-primary">Nueva orden</span>
            </p>
            <h1 className="text-2xl font-bold text-body">
              Nueva orden de compra
            </h1>
            <p className="mt-1 text-sm text-head">
              Selecciona un proveedor y agrega los productos a comprar.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-semibold text-head">
              Sucursal
            </span>
            <BranchSelect
              branches={branches}
              value={selectedBranchId}
              loading={branchesLoading}
              disabled={!canSelectBranch}
              title={
                canSelectBranch
                  ? "Seleccionar sucursal"
                  : "Sucursal asignada a tu usuario"
              }
              onChange={setSelectedBranchId}
            />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:px-6 md:py-6">
        <Can
          permission={Permission.PURCHASES_CREATE}
          fallback={
            <div className="flex items-center gap-2 rounded-lg border border-danger-bg bg-danger-bg px-4 py-3 text-sm text-danger">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              No tienes permiso para registrar órdenes de compra.
            </div>
          }
        >
          <PurchaseOrderContainer branchId={selectedBranchId} />
        </Can>
      </div>
    </main>
  );
}
