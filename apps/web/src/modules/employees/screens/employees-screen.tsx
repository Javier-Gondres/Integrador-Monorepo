"use client";

import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { PageHeader } from "@/shared/ui";

import { EmployeeFormModalContainer } from "../containers/employee-form-modal-container";
import { EmployeesTableContainer } from "../containers/employees-table-container";
import type { CompanyMember } from "../types/company-member.types";

export function EmployeesScreen() {
  const [modalMember, setModalMember] = useState<
    CompanyMember | null | undefined
  >(undefined);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Empleados" title="Empleados" />

      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <EmployeesTableContainer
          onEdit={setModalMember}
          onCreate={() => setModalMember(null)}
        />
      </div>

      {modalMember !== undefined && (
        <EmployeeFormModalContainer
          member={modalMember}
          onClose={() => setModalMember(undefined)}
        />
      )}
    </main>
  );
}
