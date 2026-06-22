"use client";

import { useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";
import { Permission } from "@/modules/auth";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { getEmployeesTableColumns } from "../components/employees-table";
import { useDeleteEmployee } from "../hooks/use-delete-employee";
import { useEmployees } from "../hooks/use-employees";
import type { Employee } from "../types/employee.types";

interface EmployeesTableContainerProps {
  onEdit: (employee: Employee) => void;
  onCreate: () => void;
}

export function EmployeesTableContainer({
  onEdit,
  onCreate,
}: EmployeesTableContainerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  const { data, isLoading, isFetching, refetch } = useEmployees(filters);
  const deleteMutation = useDeleteEmployee();

  const employees = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <>
      <DataTableToolbar
        searchPlaceholder="Buscar por nombre, email o puesto..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
        createLabel="Nuevo Empleado"
        onCreate={onCreate}
        createPermission={Permission.EMPLOYEES_CREATE}
      />

      <DataTable
        title="Lista de Empleados"
        columns={getEmployeesTableColumns({
          onEdit,
          onDelete: (id) => void deleteMutation.mutateAsync(id),
        })}
        data={employees}
        loading={isLoading}
        loadingMessage="Cargando empleados..."
        emptyMessage="No se encontraron empleados."
        total={total}
        getRowKey={(row) => row.id}
        pagination={{
          total,
          currentPage,
          totalPages,
          rowsPerPage,
          loading: isFetching,
        }}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setCurrentPage(1);
        }}
      />
    </>
  );
}
