"use client";

import { useState } from "react";

import { DataTable } from "@/shared/data-table/data-table";
import { DataTableToolbar } from "@/shared/data-table/data-table-toolbar";
import type { DataTableColumn } from "@/shared/data-table/types";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useWasteQuery } from "../hooks/use-waste";
import type { WasteListItem } from "../types/waste.types";

interface WasteTableContainerProps {
  branchId: string;
  onCreate: () => void;
}

const REASON_LABELS: Record<string, string> = {
  DAMAGE: "Dañado",
  THEFT: "Robo",
  EXPIRED: "Vencido",
  COUNT_DIFFERENCE: "Dif. Conteo",
  INTERNAL_USE: "Consumo Interno",
  OTHER: "Otro",
};

export function WasteTableContainer({
  branchId,
  onCreate,
}: WasteTableContainerProps) {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedValue(searchValue, 500);

  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);

  const { data, isLoading, isFetching, refetch } = useWasteQuery({
    page,
    take,
    search: debouncedSearch,
    branchId,
  });

  const columns: DataTableColumn<WasteListItem>[] = [
    {
      id: "product",
      header: "Producto",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">
            {row.product.name}
          </span>
          <span className="text-xs text-gray-500">{row.product.code}</span>
        </div>
      ),
    },
    {
      id: "quantity",
      header: "Cantidad",
      align: "center",
      cell: (row) => (
        <span className="font-medium text-red-600">
          -{Number(row.quantity)}
        </span>
      ),
    },
    {
      id: "reason",
      header: "Motivo",
      align: "center",
      cell: (row) => (
        <Badge
          variant={
            row.adjustmentReason === "EXPIRED" ||
            row.adjustmentReason === "DAMAGE"
              ? "error"
              : "warning"
          }
        >
          {REASON_LABELS[row.adjustmentReason] || row.adjustmentReason}
        </Badge>
      ),
    },
    {
      id: "date",
      header: "Fecha",
      align: "center",
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="flex flex-col gap-5 w-full">
      <DataTableToolbar
        searchPlaceholder="Buscar por producto..."
        searchValue={searchValue}
        onSearchChange={(val) => {
          setSearchValue(val);
          setPage(1);
        }}
        onRefresh={() => refetch()}
        refreshing={isFetching}
        createLabel="Registrar Merma"
        onCreate={onCreate}
      />

      <DataTable
        title="Historial de Mermas"
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        total={data?.meta.total ?? 0}
        getRowKey={(row) => row.id}
        emptyMessage="No se encontraron mermas."
        pagination={{
          currentPage: page,
          rowsPerPage: take,
          total: data?.meta.total ?? 0,
          totalPages: data?.meta.totalPages ?? 0,
        }}
        onPageChange={setPage}
        onRowsPerPageChange={setTake}
      />
    </div>
  );
}
