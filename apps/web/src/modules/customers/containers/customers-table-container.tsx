"use client";

import { useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { getCustomersTableColumns } from "../components/customers-table";
import { useCustomers } from "../hooks/use-customers";
import { useDeleteCustomer } from "../hooks/use-delete-customer";
import { useToggleCustomerStatus } from "../hooks/use-toggle-customer-status";
import type { Customer } from "../types/customer.types";

interface CustomersTableContainerProps {
  onEdit: (customer: Customer) => void;
  onCreate: () => void;
}

export function CustomersTableContainer({
  onEdit,
  onCreate,
}: CustomersTableContainerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  const { data, isLoading, isFetching, refetch } = useCustomers(filters);
  const deleteMutation = useDeleteCustomer();
  const toggleStatusMutation = useToggleCustomerStatus();

  const customers = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <>
      <DataTableToolbar
        searchPlaceholder="Buscar cliente..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
        createLabel="Nuevo Cliente"
        onCreate={onCreate}
      />

      <DataTable
        title="Lista de Clientes"
        columns={getCustomersTableColumns({
          onEdit,
          onDelete: (id) => void deleteMutation.mutateAsync(id),
          onToggleStatus: (id, isActive) =>
            void toggleStatusMutation.mutateAsync({ id, isActive }),
        })}
        data={customers}
        loading={isLoading}
        loadingMessage="Cargando clientes..."
        emptyMessage="No se encontraron clientes."
        total={total}
        getRowKey={(customer) => customer.id}
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
