"use client";

import { useEffect, useState } from "react";

import { useOperationalBranches } from "@/shared/hooks/use-operational-branches";
import { PageHeader, SucursalPanel } from "@/shared/ui";

import { WasteFormModalContainer } from "../containers/waste-form-modal-container";
import { WasteTableContainer } from "../containers/waste-table-container";

export function WasteScreen() {
  const { branches: sucursales, defaultBranchId } = useOperationalBranches();
  const [branchId, setBranchId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (branchId) return;
    if (defaultBranchId) setBranchId(defaultBranchId);
  }, [branchId, defaultBranchId]);

  return (
    <main className="min-h-screen bg-gray-50/50 flex flex-col">
      <PageHeader
        breadcrumb="Inventario / Mermas"
        title="Mermas de Inventario"
      />

      <div className="p-4 md:p-8 flex-1 flex flex-col gap-4 md:gap-6">
        {/* Panel de Selección de Sucursal */}
        <div className="flex w-full">
          <SucursalPanel
            role="origen"
            sucursales={sucursales}
            selectedId={branchId}
            onSelect={setBranchId}
          />
        </div>

        {/* Tabla de mermas */}
        {branchId ? (
          <WasteTableContainer
            branchId={branchId}
            onCreate={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="bg-white rounded-xl p-6 md:p-8 text-center text-gray-500 border border-gray-200">
            Selecciona una sucursal para ver y registrar mermas.
          </div>
        )}
      </div>

      {isModalOpen && branchId && (
        <WasteFormModalContainer
          branchId={branchId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </main>
  );
}
