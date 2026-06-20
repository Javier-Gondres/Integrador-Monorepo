"use client";

import { useState } from "react";

import { DEFAULT_PAGE_SIZE, ERP_COLORS as C } from "@/constants/theme";
import { BranchSelect } from "@/modules/branches/components/branch-select";
import type { BranchListItem } from "@/modules/branches/types/branch.types";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { getAdjustmentsTableColumns } from "../components/adjustments-table";
import { ADJUSTMENT_REASON_OPTIONS } from "../constants";
import { useAdjustments } from "../hooks/use-adjustments";
import type { AdjustmentReason } from "../types/inventory-adjustment.types";

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

interface AdjustmentsTableContainerProps {
  branchId: string | null;
  branches: BranchListItem[];
  branchesLoading: boolean;
  onBranchChange: (branchId: string) => void;
  onCreate: () => void;
}

export function AdjustmentsTableContainer({
  branchId,
  branches,
  branchesLoading,
  onBranchChange,
  onCreate,
}: AdjustmentsTableContainerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [reasonFilter, setReasonFilter] = useState<AdjustmentReason | "">("");

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(branchId && { branchId }),
    ...(reasonFilter && { adjustmentReason: reasonFilter }),
  };

  const { data, isLoading, isFetching, refetch } = useAdjustments(filters);

  const adjustments = data?.items ?? [];
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
          <span style={filterLabelStyle}>Razón de ajuste</span>
          <select
            aria-label="Filtrar por razón de ajuste"
            value={reasonFilter}
            onChange={(e) => {
              setReasonFilter(e.target.value as AdjustmentReason | "");
              setCurrentPage(1);
            }}
            style={{ ...filterControlStyle, minWidth: "200px" }}
          >
            <option value="">Todas</option>
            {ADJUSTMENT_REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTableToolbar
        searchPlaceholder="Buscar producto..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
        createLabel="Registrar ajuste"
        onCreate={onCreate}
      />

      <DataTable
        title="Ajustes de inventario"
        columns={getAdjustmentsTableColumns()}
        data={adjustments}
        loading={branchId ? isLoading : branchesLoading}
        loadingMessage="Cargando ajustes..."
        emptyMessage="No se encontraron ajustes."
        total={total}
        getRowKey={(a) => a.id}
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
