"use client";

import { useState } from "react";
import { toast } from "sonner";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";
import { useBranches } from "@/modules/branches/hooks/use-branches";
import { DataTable } from "@/shared/data-table";

import { getAccountsReceivableTableColumns } from "../components/accounts-receivable-table";
import { CustomerReceivablesModal } from "../components/customer-receivables-modal";
import { ReceivablePaymentHistoryModal } from "../components/receivable-payment-history-modal";
import { RegisterReceivablePaymentModal } from "../components/register-receivable-payment-modal";
import { SaleDetailModal } from "../components/sale-detail-modal";
import { useCreateReceivablePayment,useReceivableCustomers } from "../hooks/use-accounts-receivable";
import type { AccountReceivable, ReceivableCustomerSummary } from "../types/accounts-receivable";

export function AccountsReceivableTableContainer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [branchId, setBranchId] = useState<string>("todas");

  const [selectedCustomer, setSelectedCustomer] = useState<ReceivableCustomerSummary | null>(null);
  const [paymentReceivable, setPaymentReceivable] = useState<AccountReceivable | null>(null);
  const [historyReceivableId, setHistoryReceivableId] = useState<string | null>(null);
  const [saleDetailId, setSaleDetailId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useReceivableCustomers({
    page: currentPage,
    take: rowsPerPage,
    branchId: branchId !== "todas" ? branchId : undefined,
  });

  const { data: branches } = useBranches();
  const createPaymentMutation = useCreateReceivablePayment();

  const customers = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handlePay = async (paymentData: { amount: number; method: string; notes?: string }) => {
    if (!paymentReceivable) return;
    try {
      await createPaymentMutation.mutateAsync({
        id: paymentReceivable.id,
        data: paymentData,
      });
      toast.success("Abono registrado correctamente");
      setPaymentReceivable(null);
    } catch {
      toast.error("Error al registrar el abono");
    }
  };

  return (
    <>
      {/* Branch filter */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[13px] text-gray-500 whitespace-nowrap">
          Sucursal:
        </span>
        <select
          value={branchId}
          onChange={(e) => {
            setBranchId(e.target.value);
            setCurrentPage(1);
          }}
          className="h-8 px-2 border border-gray-200 rounded-md text-[13px] text-gray-900 bg-white cursor-pointer outline-none min-w-[200px]"
        >
          <option value="todas">Todas las sucursales</option>
          {branches?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable<ReceivableCustomerSummary>
        title="Clientes con Saldo Pendiente"
        columns={getAccountsReceivableTableColumns({ onViewCustomer: setSelectedCustomer })}
        data={customers}
        loading={isLoading}
        loadingMessage="Cargando clientes..."
        emptyMessage="No hay clientes con cuentas por cobrar pendientes."
        total={total}
        getRowKey={(row) => row.id}
        pagination={{
          total,
          currentPage,
          totalPages,
          rowsPerPage,
          loading: isFetching,
        }}
        onPageChange={(p) => setCurrentPage(p)}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setCurrentPage(1);
        }}
      />

      {selectedCustomer && (
        <CustomerReceivablesModal
          customer={selectedCustomer}
          branchId={branchId}
          onClose={() => setSelectedCustomer(null)}
          onPay={setPaymentReceivable}
          onViewHistory={(r) => setHistoryReceivableId(r.id)}
          onViewSale={setSaleDetailId}
        />
      )}

      {paymentReceivable && (
        <RegisterReceivablePaymentModal
          receivable={paymentReceivable}
          onClose={() => setPaymentReceivable(null)}
          onSubmit={handlePay}
          isSubmitting={createPaymentMutation.isPending}
        />
      )}

      {historyReceivableId && (
        <ReceivablePaymentHistoryModal
          receivableId={historyReceivableId}
          onClose={() => setHistoryReceivableId(null)}
          onViewSale={setSaleDetailId}
        />
      )}

      {saleDetailId && (
        <SaleDetailModal
          saleId={saleDetailId}
          onClose={() => setSaleDetailId(null)}
        />
      )}
    </>
  );
}
