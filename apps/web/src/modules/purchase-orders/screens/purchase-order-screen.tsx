"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/modules/auth/hooks/use-auth";
import { BranchSelect } from "@/modules/branches/components/branch-select";
import { useBranches } from "@/modules/branches/hooks/use-branches";

import { PurchaseOrderContainer } from "../containers/purchase-order-container";

export function PurchaseOrderScreen() {
  const { user } = useAuth();
  const { data: branches, isLoading: branchesLoading } = useBranches();

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Sucursal inicial: la activa del usuario, o la primera disponible.
  useEffect(() => {
    if (selectedBranchId) return;
    const fallback = user?.branchId ?? branches?.[0]?.id ?? null;
    if (fallback) setSelectedBranchId(fallback);
  }, [user?.branchId, branches, selectedBranchId]);

  return (
    <main className="min-h-screen bg-page">
      <div className="border-b border-card-border bg-card px-10 py-5">
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
              branches={branches ?? []}
              value={selectedBranchId}
              loading={branchesLoading}
              onChange={setSelectedBranchId}
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <PurchaseOrderContainer branchId={selectedBranchId} />
      </div>
    </main>
  );
}
