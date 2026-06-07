"use client";

import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { PageHeader } from "@/shared/ui";

import { SupplierFormModalContainer } from "../containers/supplier-form-modal-container";
import { SuppliersTableContainer } from "../containers/suppliers-table-container";
import type { Supplier } from "../types/supplier.types";

export function SuppliersScreen() {
  const [modalSupplier, setModalSupplier] = useState<
    Supplier | null | undefined
  >(undefined);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Proveedores" title="Proveedores" />

      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <SuppliersTableContainer
          onEdit={setModalSupplier}
          onCreate={() => setModalSupplier(null)}
        />
      </div>

      {modalSupplier !== undefined && (
        <SupplierFormModalContainer
          supplier={modalSupplier}
          onClose={() => setModalSupplier(undefined)}
        />
      )}
    </main>
  );
}
