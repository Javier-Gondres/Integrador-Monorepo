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

      <div className="flex flex-col gap-5 p-4 md:p-8 lg:px-10">
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
