"use client";

import { useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";
import { useBranches } from "@/modules/branches/hooks/use-branches";
import { DataTable } from "@/shared/data-table";

import { getPurchaseHistoryColumns } from "../components/purchase-history-table";
import { usePurchases } from "../hooks/use-purchases";
import type { PurchaseListDto } from "../types/purchase-history.types";
import { PurchaseDetailModalContainer } from "./purchase-detail-modal-container";

const ALL_BRANCHES = "todas";

export function PurchaseHistoryTableContainer() {
  const [branchFilter, setBranchFilter] = useState<string>(ALL_BRANCHES);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [detail, setDetail] = useState<PurchaseListDto | null>(null);

  const { data: branches } = useBranches();

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(branchFilter !== ALL_BRANCHES && { branchId: branchFilter }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data, isLoading, isFetching } = usePurchases(filters);

  const purchases = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;
  const dirty =
    branchFilter !== ALL_BRANCHES || dateFrom !== "" || dateTo !== "";

  const resetPage = () => setCurrentPage(1);

  return (
    <>
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-card-border bg-card p-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-head">Sucursal</span>
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              resetPage();
            }}
            className="h-10 min-w-52 rounded-lg border border-input-border bg-white px-3 text-sm text-body outline-none focus:border-primary"
          >
            <option value={ALL_BRANCHES}>Todas las sucursales</option>
            {(branches ?? []).map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-head">Desde</span>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => {
              const value = e.target.value;
              if (dateTo && value > dateTo) return;
              setDateFrom(value);
              resetPage();
            }}
            className="h-10 rounded-lg border border-input-border bg-white px-3 text-sm text-body outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-head">Hasta</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => {
              const value = e.target.value;
              if (dateFrom && value < dateFrom) return;
              setDateTo(value);
              resetPage();
            }}
            className="h-10 rounded-lg border border-input-border bg-white px-3 text-sm text-body outline-none focus:border-primary"
          />
        </label>

        <button
          type="button"
          disabled={!dirty}
          onClick={() => {
            setBranchFilter(ALL_BRANCHES);
            setDateFrom("");
            setDateTo("");
            resetPage();
          }}
          className="h-10 rounded-lg border border-card-border bg-white px-4 text-sm font-semibold text-head transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Limpiar filtros
        </button>
      </div>

      <DataTable
        title="Órdenes registradas"
        columns={getPurchaseHistoryColumns({ onViewDetail: setDetail })}
        data={purchases}
        loading={isLoading}
        loadingMessage="Cargando compras..."
        emptyMessage="No hay compras que coincidan con los filtros seleccionados."
        total={total}
        getRowKey={(purchase) => purchase.id}
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
          resetPage();
        }}
      />

      {detail && (
        <PurchaseDetailModalContainer
          purchaseId={detail.id}
          fallbackTitle={detail.supplier.name}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
