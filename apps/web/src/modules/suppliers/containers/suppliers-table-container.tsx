"use client";

import { useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";
import { Permission } from "@/modules/auth";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { getSuppliersTableColumns } from "../components/suppliers-table";
import { useDeleteSupplier } from "../hooks/use-delete-supplier";
import { useSuppliers } from "../hooks/use-suppliers";
import type { Supplier } from "../types/supplier.types";

interface SuppliersTableContainerProps {
  onEdit: (supplier: Supplier) => void;
  onCreate: () => void;
}

export function SuppliersTableContainer({
  onEdit,
  onCreate,
}: SuppliersTableContainerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  const { data, isLoading, isFetching, refetch } = useSuppliers(filters);
  const deleteMutation = useDeleteSupplier();

  const suppliers = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <>
      <DataTableToolbar
        searchPlaceholder="Buscar proveedor..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
        createLabel="Nuevo Proveedor"
        onCreate={onCreate}
        createPermission={Permission.SUPPLIERS_CREATE}
      />

      <DataTable
        title="Lista de Proveedores"
        columns={getSuppliersTableColumns({
          onEdit,
          onDelete: (id) => void deleteMutation.mutateAsync(id),
        })}
        data={suppliers}
        loading={isLoading}
        loadingMessage="Cargando proveedores..."
        emptyMessage="No se encontraron proveedores."
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
