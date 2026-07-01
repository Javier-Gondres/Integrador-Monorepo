"use client";

import { RotateCw } from "lucide-react";
import { useState } from "react";

import { DEFAULT_PAGE_SIZE, ERP_COLORS as C } from "@/constants/theme";
import { BranchSelect } from "@/modules/branches/components/branch-select";
import { DataTable } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { Button } from "@/shared/ui/button";
import { SearchInput } from "@/shared/ui/input";

import { getInventoryMovementsTableColumns } from "../components/inventory-movements-table";
import { MOVEMENT_TYPE_OPTIONS } from "../constants";
import { useInventoryMovements } from "../hooks/use-inventory-movements";
import type { MovementType } from "../types/inventory-movement.types";

const controlStyle: React.CSSProperties = {
  height: "40px",
  padding: "0 14px",
  border: `1px solid ${C.inputBorder}`,
  borderRadius: "8px",
  fontSize: "14px",
  color: C.bodyText,
  backgroundColor: C.cardBg,
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: C.headText,
};

interface InventoryMovementsTableContainerProps {
  branchId: string | null;
  branches: Array<{ id: string; name: string }>;
  branchesLoading: boolean;
  onBranchChange: (branchId: string) => void;
}

export function InventoryMovementsTableContainer({
  branchId,
  branches,
  branchesLoading,
  onBranchChange,
}: InventoryMovementsTableContainerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [typeFilter, setTypeFilter] = useState<MovementType | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(branchId && { branchId }),
    ...(typeFilter && { type: typeFilter }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data, isLoading, isFetching, refetch } =
    useInventoryMovements(filters);

  const movements = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

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
          <span style={labelStyle}>Sucursal</span>
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
          <span style={labelStyle}>Tipo</span>
          <select
            aria-label="Filtrar por tipo"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as MovementType | "");
              setCurrentPage(1);
            }}
            style={{ ...controlStyle, cursor: "pointer", minWidth: "180px" }}
          >
            <option value="">Todos</option>
            {MOVEMENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={labelStyle}>Desde</span>
          <input
            type="date"
            aria-label="Fecha desde"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => {
              const value = e.target.value;
              if (dateTo && value > dateTo) return;
              setDateFrom(value);
              setCurrentPage(1);
            }}
            style={controlStyle}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={labelStyle}>Hasta</span>
          <input
            type="date"
            aria-label="Fecha hasta"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => {
              const value = e.target.value;
              if (dateFrom && value < dateFrom) return;
              setDateTo(value);
              setCurrentPage(1);
            }}
            style={controlStyle}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <SearchInput
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <Button variant="icon" onClick={() => void refetch()} title="Refrescar">
          <RotateCw
            style={{ width: "16px", height: "16px" }}
            className={isFetching ? "animate-spin" : ""}
          />
        </Button>
      </div>

      <DataTable
        title="Movimientos de inventario"
        columns={getInventoryMovementsTableColumns()}
        data={movements}
        loading={branchId ? isLoading : branchesLoading}
        loadingMessage="Cargando movimientos..."
        emptyMessage="No se encontraron movimientos."
        total={total}
        getRowKey={(m) => m.id}
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
