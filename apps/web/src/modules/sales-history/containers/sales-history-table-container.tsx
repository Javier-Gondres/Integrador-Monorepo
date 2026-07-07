"use client";

import { useMemo, useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";
import { useCajas } from "@/modules/cajas/hooks/use-cajas";
import { useCustomers } from "@/modules/customers/hooks/use-customers";
import { useEmployees } from "@/modules/employees/hooks/use-employees";
import type { SaleStatus } from "@/modules/sales/types/sale.types";
import { DataTable } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { useOperationalBranches } from "@/shared/hooks/use-operational-branches";
import { SearchInput } from "@/shared/ui";

import type { EntityOption } from "../components/entity-combobox";
import { EntityCombobox } from "../components/entity-combobox";
import { getSalesHistoryColumns } from "../components/sales-history-table";
import { useSales } from "../hooks/use-sales";
import type { SaleListDto } from "../types/sales-history.types";
import { SALE_STATUS_OPTIONS } from "../utils/sale-status";
import { SaleDetailModalContainer } from "./sale-detail-modal-container";

const ALL = "todas";

export function SalesHistoryTableContainer() {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>(ALL);
  const [cashRegisterFilter, setCashRegisterFilter] = useState<string>(ALL);
  const [statusFilter, setStatusFilter] = useState<SaleStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [customer, setCustomer] = useState<EntityOption | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [cashier, setCashier] = useState<EntityOption | null>(null);
  const [cashierSearch, setCashierSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [detail, setDetail] = useState<SaleListDto | null>(null);

  const debouncedSearch = useDebouncedValue(search);
  const debouncedCustomerSearch = useDebouncedValue(customerSearch);
  const debouncedCashierSearch = useDebouncedValue(cashierSearch);

  const branchId = branchFilter !== ALL ? branchFilter : undefined;

  const { branches, canSelectBranch } = useOperationalBranches();
  const { cajas } = useCajas(branchId);

  const { data: customersPage, isLoading: customersLoading } = useCustomers({
    take: 20,
    ...(debouncedCustomerSearch.trim() && {
      search: debouncedCustomerSearch.trim(),
    }),
  });
  const { data: employeesPage, isLoading: employeesLoading } = useEmployees({
    take: 20,
    ...(branchId && { branchId }),
    ...(debouncedCashierSearch.trim() && {
      search: debouncedCashierSearch.trim(),
    }),
  });

  const customerOptions: EntityOption[] = useMemo(
    () =>
      (customersPage?.items ?? []).map((c) => ({
        id: c.id,
        label: c.fullName,
      })),
    [customersPage],
  );
  const cashierOptions: EntityOption[] = useMemo(
    () =>
      (employeesPage?.items ?? []).map((e) => ({
        id: e.id,
        label: e.fullName,
      })),
    [employeesPage],
  );

  const resetPage = () => setCurrentPage(1);

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
    ...(branchId && { branchId }),
    ...(customer && { customerId: customer.id }),
    ...(cashier && { cashierId: cashier.id }),
    ...(cashRegisterFilter !== ALL && { cashRegisterId: cashRegisterFilter }),
    ...(statusFilter && { status: statusFilter }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data, isLoading, isFetching } = useSales(filters);

  const sales = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const dirty =
    search !== "" ||
    branchFilter !== ALL ||
    cashRegisterFilter !== ALL ||
    statusFilter !== "" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    customer !== null ||
    cashier !== null;

  const handleBranchChange = (value: string) => {
    setBranchFilter(value);
    // Cajas y cajeros pertenecen a una sucursal: limpiar al cambiar de sucursal.
    setCashRegisterFilter(ALL);
    setCashier(null);
    setCashierSearch("");
    resetPage();
  };

  const clearFilters = () => {
    setSearch("");
    setBranchFilter(ALL);
    setCashRegisterFilter(ALL);
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setCustomer(null);
    setCustomerSearch("");
    setCashier(null);
    setCashierSearch("");
    resetPage();
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-card-border bg-card p-4">
        <div className="max-w-md">
          <SearchInput
            placeholder="Buscar por NCF..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-head">
              Sucursal
            </span>
            <select
              value={branchFilter}
              disabled={!canSelectBranch}
              title={
                !canSelectBranch
                  ? "Solo puedes ver tu sucursal asignada"
                  : undefined
              }
              onChange={(e) => handleBranchChange(e.target.value)}
              className="h-10 min-w-52 rounded-lg border border-input-border bg-white px-3 text-sm text-body outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {canSelectBranch && (
                <option value={ALL}>Todas las sucursales</option>
              )}
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>

          <EntityCombobox
            label="Cajero"
            placeholder="Todos los cajeros"
            searchPlaceholder="Buscar cajero..."
            emptyMessage="No se encontraron cajeros"
            search={cashierSearch}
            onSearchChange={setCashierSearch}
            options={cashierOptions}
            selected={cashier}
            onSelect={(option) => {
              setCashier(option);
              resetPage();
            }}
            onClear={() => {
              setCashier(null);
              resetPage();
            }}
            loading={employeesLoading}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-head">Caja</span>
            <select
              value={cashRegisterFilter}
              onChange={(e) => {
                setCashRegisterFilter(e.target.value);
                resetPage();
              }}
              className="h-10 min-w-44 rounded-lg border border-input-border bg-white px-3 text-sm text-body outline-none focus:border-primary"
            >
              <option value={ALL}>Todas las cajas</option>
              {cajas.map((caja) => (
                <option key={caja.id} value={caja.id}>
                  {caja.nombre}
                </option>
              ))}
            </select>
          </label>

          <EntityCombobox
            label="Cliente"
            placeholder="Todos los clientes"
            searchPlaceholder="Buscar cliente..."
            emptyMessage="No se encontraron clientes"
            search={customerSearch}
            onSearchChange={setCustomerSearch}
            options={customerOptions}
            selected={customer}
            onSelect={(option) => {
              setCustomer(option);
              resetPage();
            }}
            onClear={() => {
              setCustomer(null);
              resetPage();
            }}
            loading={customersLoading}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-head">Estado</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as SaleStatus | "");
                resetPage();
              }}
              className="h-10 min-w-44 rounded-lg border border-input-border bg-white px-3 text-sm text-body outline-none focus:border-primary"
            >
              <option value="">Todos los estados</option>
              {SALE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
            onClick={clearFilters}
            className="h-10 rounded-lg border border-card-border bg-white px-4 text-sm font-semibold text-head transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <DataTable
        title="Ventas registradas"
        columns={getSalesHistoryColumns({ onViewDetail: setDetail })}
        data={sales}
        loading={isLoading}
        loadingMessage="Cargando ventas..."
        emptyMessage="No hay ventas que coincidan con los filtros seleccionados."
        total={total}
        getRowKey={(sale) => sale.id}
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
        <SaleDetailModalContainer
          saleId={detail.id}
          fallbackTitle={detail.customerName ?? detail.ncf ?? "Venta"}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
