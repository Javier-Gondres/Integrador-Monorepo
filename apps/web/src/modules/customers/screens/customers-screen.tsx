"use client";

import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { PageHeader } from "@/shared/ui";

import { CustomerFormModalContainer } from "../containers/customer-form-modal-container";
import { CustomersTableContainer } from "../containers/customers-table-container";
import type { Customer } from "../types/customer.types";

export function CustomersScreen() {
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | null | undefined
  >(undefined);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Clientes" title="Clientes" />

      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <CustomersTableContainer
          onEdit={setSelectedCustomer}
          onCreate={() => setSelectedCustomer(null)}
        />
      </div>

      {selectedCustomer !== undefined && (
        <CustomerFormModalContainer
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(undefined)}
        />
      )}
    </main>
  );
}
