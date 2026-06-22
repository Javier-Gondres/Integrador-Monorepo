"use client";

import { useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";
import { Permission } from "@/modules/auth";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { Select } from "@/shared/ui";

import { getDiscountsTableColumns } from "../components/discounts-table";
import { useDeleteDiscount } from "../hooks/use-delete-discount";
import { useDiscounts } from "../hooks/use-discounts";
import { useToggleDiscountStatus } from "../hooks/use-toggle-discount-status";
import type { Discount } from "../types/discount.types";

interface DiscountsTableContainerProps {
  onEdit: (discount: Discount) => void;
  onCreate: () => void;
}

type StatusFilter = "Todos" | "Activos" | "Inactivos" | "Vigentes";

export function DiscountsTableContainer({
  onEdit,
  onCreate,
}: DiscountsTableContainerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todos");

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter === "Activos" && { isActive: true }),
    ...(statusFilter === "Inactivos" && { isActive: false }),
    ...(statusFilter === "Vigentes" && { isCurrent: true }),
  };

  const { data, isLoading, isFetching, refetch } = useDiscounts(filters);
  const deleteMutation = useDeleteDiscount();
  const toggleStatusMutation = useToggleDiscountStatus();

  const discounts = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <>
      <DataTableToolbar
        searchPlaceholder="Buscar descuento..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
        createLabel="Nuevo Descuento"
        onCreate={onCreate}
        createPermission={Permission.DISCOUNTS_CREATE}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600 }}>Estado</span>
        <Select
          options={["Todos", "Activos", "Inactivos", "Vigentes"]}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setCurrentPage(1);
          }}
          style={{ minWidth: "180px" }}
        />
      </div>

      <DataTable
        title="Lista de Descuentos"
        columns={getDiscountsTableColumns({
          onEdit,
          onDelete: (id) => void deleteMutation.mutateAsync(id),
          onToggleStatus: (id, isActive) =>
            void toggleStatusMutation.mutateAsync({ id, isActive }),
        })}
        data={discounts}
        loading={isLoading}
        loadingMessage="Cargando descuentos..."
        emptyMessage="No se encontraron descuentos."
        total={total}
        getRowKey={(discount) => discount.id}
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
