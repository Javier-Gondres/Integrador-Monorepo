"use client";

import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { PageHeader } from "@/shared/ui";

import { EmployeeFormModalContainer } from "../containers/employee-form-modal-container";
import { EmployeesTableContainer } from "../containers/employees-table-container";
import type { Employee } from "../types/employee.types";

export function EmployeesScreen() {
  const [modalEmployee, setModalEmployee] = useState<
    Employee | null | undefined
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
          onEdit={setModalEmployee}
          onCreate={() => setModalEmployee(null)}
        />
      </div>

      {modalEmployee !== undefined && (
        <EmployeeFormModalContainer
          employee={modalEmployee}
          onClose={() => setModalEmployee(undefined)}
        />
      )}
    </main>
  );
}
