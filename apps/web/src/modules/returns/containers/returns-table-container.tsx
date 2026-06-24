"use client";

import { useState } from "react";

import { DEFAULT_PAGE_SIZE, ERP_COLORS as C } from "@/constants/theme";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { getReturnsTableColumns } from "../components/returns-table";
import { useReturns } from "../hooks/use-returns";
import type { ReturnFilters, ReturnListItem } from "../types/return.types";
import { endOfDayIso, startOfDayIso } from "../utils/format";

interface ReturnsTableContainerProps {
  onRegister: () => void;
  onViewDetails: (returnItem: ReturnListItem) => void;
}

export function ReturnsTableContainer({
  onRegister,
  onViewDetails,
}: ReturnsTableContainerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const invalidRange = Boolean(dateFrom && dateTo && dateFrom > dateTo);

  const filters: ReturnFilters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(!invalidRange && dateFrom && { dateFrom: startOfDayIso(dateFrom) }),
    ...(!invalidRange && dateTo && { dateTo: endOfDayIso(dateTo) }),
  };

  const { data, isLoading, isFetching, refetch } = useReturns(filters);

  const returns = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setCurrentPage(1);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setCurrentPage(1);
  };

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "12px",
          flexWrap: "wrap",
          padding: "16px",
          backgroundColor: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          borderRadius: "10px",
        }}
      >
        <div style={{ width: "180px" }}>
          <Input
            label="Desde"
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => handleDateFromChange(e.target.value)}
          />
        </div>
        <div style={{ width: "180px" }}>
          <Input
            label="Hasta"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => handleDateToChange(e.target.value)}
          />
        </div>
        {(dateFrom || dateTo) && (
          <Button variant="secondary" onClick={clearDates}>
            Limpiar fechas
          </Button>
        )}
        {invalidRange && (
          <span style={{ fontSize: "12px", color: C.danger }}>
            La fecha &quot;Desde&quot; no puede ser mayor que la fecha
            &quot;Hasta&quot;.
          </span>
        )}
      </div>

      <DataTableToolbar
        searchPlaceholder="Buscar por NCF, cliente o sucursal..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
        createLabel="Registrar devolución"
        onCreate={onRegister}
      />

      <DataTable
        title="Lista de Devoluciones"
        columns={getReturnsTableColumns({ onViewDetails })}
        data={returns}
        loading={isLoading}
        loadingMessage="Cargando devoluciones..."
        emptyMessage="No se encontraron devoluciones."
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
