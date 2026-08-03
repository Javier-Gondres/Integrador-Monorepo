"use client";

import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";
import { Permission, usePermissions } from "@/modules/auth";
import { useBranches } from "@/modules/branches/hooks/use-branches";
import { useSuppliers } from "@/modules/suppliers/hooks/use-suppliers";
import { DataTable } from "@/shared/data-table";

import { getAccountsPayableColumns } from "../components/accounts-payable-table";
import { PaymentHistoryModal } from "../components/payment-history-modal";
import { RegisterPaymentModal } from "../components/register-payment-modal";
import {
  useAccountsPayable,
  useCreatePayablePayment,
  useUpdateAccountPayable,
} from "../hooks/use-accounts-payable";
import type { AccountPayable, PayableStatus } from "../types/accounts-payable";

const ALL_BRANCHES = "todas";
const ALL_SUPPLIERS = "todos";
const ALL_STATUSES = "todos";

export function AccountsPayableTableContainer() {
  const { can } = usePermissions();
  const canUpdatePayable = can(Permission.PAYABLES_UPDATE);
  const canPayPayable = can(Permission.PAYABLES_PAY);

  const [branchFilter, setBranchFilter] = useState<string>(ALL_BRANCHES);
  const [supplierFilter, setSupplierFilter] = useState<string>(ALL_SUPPLIERS);
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUSES);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [detail, setDetail] = useState<AccountPayable | null>(null);

  const [editingDueDate, setEditingDueDate] = useState<AccountPayable | null>(
    null,
  );
  const [newDueDate, setNewDueDate] = useState("");
  const updateMutation = useUpdateAccountPayable();

  const [payingAccount, setPayingAccount] = useState<AccountPayable | null>(
    null,
  );
  const paymentMutation = useCreatePayablePayment();

  useEffect(() => {
    if (updateMutation.isSuccess) {
      setEditingDueDate(null);
      setNewDueDate("");
      updateMutation.reset();
    }
  }, [updateMutation.isSuccess, updateMutation]);

  useEffect(() => {
    if (paymentMutation.isSuccess) {
      setPayingAccount(null);
      paymentMutation.reset();
    }
  }, [paymentMutation.isSuccess, paymentMutation]);

  const { data: branches } = useBranches();
  const { data: suppliersData } = useSuppliers({ page: 1, take: 100 });
  const suppliers = suppliersData?.items ?? [];

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(branchFilter !== ALL_BRANCHES && { branchId: branchFilter }),
    ...(supplierFilter !== ALL_SUPPLIERS && { supplierId: supplierFilter }),
    ...(statusFilter !== ALL_STATUSES && {
      status: statusFilter as PayableStatus,
    }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data, isLoading, isFetching } = useAccountsPayable(filters);

  const payables = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;
  const dirty =
    branchFilter !== ALL_BRANCHES ||
    supplierFilter !== ALL_SUPPLIERS ||
    statusFilter !== ALL_STATUSES ||
    dateFrom !== "" ||
    dateTo !== "";

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
            className="h-10 min-w-40 rounded-lg border border-input-border bg-white px-3 text-sm text-body outline-none focus:border-primary"
          >
            <option value={ALL_BRANCHES}>Todas</option>
            {(branches ?? []).map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-head">Proveedor</span>
          <select
            value={supplierFilter}
            onChange={(e) => {
              setSupplierFilter(e.target.value);
              resetPage();
            }}
            className="h-10 min-w-40 rounded-lg border border-input-border bg-white px-3 text-sm text-body outline-none focus:border-primary"
          >
            <option value={ALL_SUPPLIERS}>Todos</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-head">Estado</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              resetPage();
            }}
            className="h-10 min-w-40 rounded-lg border border-input-border bg-white px-3 text-sm text-body outline-none focus:border-primary"
          >
            <option value={ALL_STATUSES}>Todos</option>
            <option value="OPEN">Pendiente</option>
            <option value="PARTIAL">Abonado</option>
            <option value="PAID">Pagada</option>
            <option value="OVERDUE">Vencida</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-head">
            Vencimiento Desde
          </span>
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
          <span className="text-[13px] font-semibold text-head">
            Vencimiento Hasta
          </span>
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
            setSupplierFilter(ALL_SUPPLIERS);
            setStatusFilter(ALL_STATUSES);
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
        title="Cuentas por pagar"
        columns={getAccountsPayableColumns({
          onViewDetail: setDetail,
          onEditDueDate: canUpdatePayable
            ? (item) => {
                setEditingDueDate(item);
                setNewDueDate(format(parseISO(item.dueDate), "yyyy-MM-dd"));
              }
            : undefined,
          onPay: canPayPayable ? setPayingAccount : undefined,
        })}
        data={payables}
        loading={isLoading}
        loadingMessage="Cargando cuentas..."
        emptyMessage="No hay cuentas que coincidan con los filtros seleccionados."
        total={total}
        getRowKey={(payable) => payable.id}
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

      {canUpdatePayable && editingDueDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-head">
              Editar fecha de vencimiento
            </h3>
            <label className="mb-4 flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-head">
                Nueva fecha
              </span>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="h-10 rounded-lg border border-input-border bg-white px-3 text-sm text-body outline-none focus:border-primary"
              />
            </label>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditingDueDate(null);
                  setNewDueDate("");
                }}
                className="rounded-lg border border-input-border px-4 py-2 text-sm font-semibold text-head transition-colors hover:bg-body/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!newDueDate || updateMutation.isPending}
                onClick={() => {
                  if (newDueDate) {
                    updateMutation.mutate({
                      id: editingDueDate.id,
                      data: { dueDate: parseISO(newDueDate).toISOString() },
                    });
                  }
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {updateMutation.isPending ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {canPayPayable && payingAccount && (
        <RegisterPaymentModal
          payable={payingAccount}
          onClose={() => setPayingAccount(null)}
          onSubmit={(data) =>
            paymentMutation.mutate({ id: payingAccount.id, data })
          }
          isSubmitting={paymentMutation.isPending}
        />
      )}

      {detail && (
        <PaymentHistoryModal
          payableId={detail.id}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
