"use client";

import { useState } from "react";

import { DEFAULT_PAGE_SIZE, ERP_COLORS as C } from "@/constants/theme";
import { BranchSelect } from "@/modules/branches/components/branch-select";
import type { BranchListItem } from "@/modules/branches/types/branch.types";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { getInventoriesTableColumns } from "../components/inventories-table";
import { useInventories } from "../hooks/use-inventories";
import { useToggleInventoryStatus } from "../hooks/use-toggle-inventory-status";
import type { Inventory } from "../types/inventory.types";

type StatusFilter = "all" | "active" | "inactive";

const filterControlStyle: React.CSSProperties = {
  height: "40px",
  padding: "0 14px",
  border: `1px solid ${C.inputBorder}`,
  borderRadius: "8px",
  fontSize: "14px",
  color: C.bodyText,
  backgroundColor: C.cardBg,
  cursor: "pointer",
  outline: "none",
};

const filterLabelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: C.headText,
};

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [needsRestock, setNeedsRestock] = useState(false);

  const toggleStatusMutation = useToggleInventoryStatus();

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(branchId && { branchId }),
    ...(statusFilter !== "all" && { isActive: statusFilter === "active" }),
    ...(needsRestock && { needsRestock: true }),
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
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={filterLabelStyle}>Sucursal</span>
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

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={filterLabelStyle}>Estado</span>
          <select
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setCurrentPage(1);
            }}
            style={{ ...filterControlStyle, minWidth: "140px" }}
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            ...filterLabelStyle,
          }}
        >
          <input
            type="checkbox"
            checked={needsRestock}
            onChange={(e) => {
              setNeedsRestock(e.target.checked);
              setCurrentPage(1);
            }}
            style={{
              width: "16px",
              height: "16px",
              accentColor: C.primary,
              cursor: "pointer",
            }}
          />
          Por reabastecer
        </label>
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
        columns={getInventoriesTableColumns({
          onEdit,
          onToggleStatus: (id, isActive) =>
            void toggleStatusMutation.mutateAsync({ id, isActive }),
        })}
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
