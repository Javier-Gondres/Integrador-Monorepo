"use client";

import { useState } from "react";

import { DEFAULT_PAGE_SIZE, ERP_COLORS as C } from "@/constants/theme";
import type { BranchListItem } from "@/modules/branches/types/branch.types";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { BranchSelect } from "../components/branch-select";
import { getInventoriesTableColumns } from "../components/inventories-table";
import { useInventories } from "../hooks/use-inventories";
import type { Inventory } from "../types/inventory.types";

interface InventoriesTableContainerProps {
  branchId: string | null;
  branches: BranchListItem[];
  branchesLoading: boolean;
  onBranchChange: (branchId: string) => void;
  onEdit: (inventory: Inventory) => void;
  onCreate: () => void;
}

export function InventoriesTableContainer({
  branchId,
  branches,
  branchesLoading,
  onBranchChange,
  onEdit,
  onCreate,
}: InventoriesTableContainerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(branchId && { branchId }),
  };

  const { data, isLoading, isFetching, refetch } = useInventories(filters);

  const inventories = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: C.headText }}>
          Sucursal
        </span>
        <BranchSelect
          branches={branches}
          value={branchId}
          loading={branchesLoading}
          onChange={(id) => {
            onBranchChange(id);
            setCurrentPage(1);
          }}
        />
      </div>

      <DataTableToolbar
        searchPlaceholder="Buscar producto..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
        createLabel="Asignar Productos"
        onCreate={onCreate}
      />

      <DataTable
        title="Listado de inventario"
        columns={getInventoriesTableColumns({ onEdit })}
        data={inventories}
        loading={branchId ? isLoading : branchesLoading}
        loadingMessage="Cargando inventario..."
        emptyMessage="No se encontraron productos."
        total={total}
        getRowKey={(inv) => inv.id}
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
