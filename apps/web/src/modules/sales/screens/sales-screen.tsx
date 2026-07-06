"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Permission } from "@/modules/auth";
import { BranchSelect } from "@/modules/branches/components/branch-select";
import { useOperationalBranches } from "@/shared/hooks/use-operational-branches";
import { Can } from "@/shared/ui/can";

import { SaleScreenContainer } from "../containers/sale-screen-container";
import { useCurrentShift } from "../hooks/use-current-shift";

export function SalesScreen() {
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

  const { data: shiftData, isLoading: shiftLoading } =
    useCurrentShift(selectedBranchId);
  const shift = shiftData?.shift ?? null;
  const hasOpenShift = Boolean(shift);

  return (
    <main className="flex min-h-screen flex-col bg-page lg:h-screen lg:min-h-0 lg:overflow-hidden">
      <div className="flex-none border-b border-card-border bg-card px-8 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[13px] text-muted">
              Panel / Ventas /{" "}
              <span className="text-primary">Nueva factura</span>
            </p>
            <h1 className="text-2xl font-bold text-body">Facturación</h1>
            <p className="mt-1 text-sm text-head">
              Registra el cliente, agrega productos y genera la factura.
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

        {!shiftLoading &&
          (hasOpenShift ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-border bg-green-bg px-3 py-2 text-sm text-green-text">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Caja <strong>{shift?.cashRegisterName}</strong> · turno abierto.
                Listo para facturar.
              </span>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-danger-bg bg-danger-bg px-3 py-2 text-sm text-danger">
              <AlertTriangle className="h-4 w-4" />
              <span>
                No hay un turno de caja abierto en esta sucursal. Abre un turno
                para poder facturar.
              </span>
              <Link
                href="/cajas"
                className="font-semibold underline underline-offset-2"
              >
                Ir a Cajas
              </Link>
            </div>
          ))}
      </div>

      <div className="flex flex-1 flex-col px-6 py-6 lg:min-h-0">
        <Can
          permission={Permission.SALES_CREATE}
          fallback={
            <div className="flex items-center gap-2 rounded-lg border border-danger-bg bg-danger-bg px-4 py-3 text-sm text-danger">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              No tienes permiso para registrar ventas.
            </div>
          }
        >
          <SaleScreenContainer
            branchId={selectedBranchId}
            hasOpenShift={hasOpenShift}
          />
        </Can>
      </div>
    </main>
  );
}
