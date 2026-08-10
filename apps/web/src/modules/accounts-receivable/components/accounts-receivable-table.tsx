import { Eye } from "lucide-react";

import type { DataTableColumn } from "@/shared/data-table";
import { Button } from "@/shared/ui/button";

import type { ReceivableCustomerSummary } from "../types/accounts-receivable";

const formatCurrencyLocal = (value: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(value);
};

interface AccountsReceivableTableActions {
  onViewCustomer: (customer: ReceivableCustomerSummary) => void;
}

export function getAccountsReceivableTableColumns(
  actions: AccountsReceivableTableActions,
): DataTableColumn<ReceivableCustomerSummary>[] {
  return [
    {
      id: "name",
      header: "Cliente",
      align: "left",
      cell: (row) => (
        <span style={{ fontWeight: 600 }}>
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      id: "phone",
      header: "Teléfono",
      align: "center",
      cell: (row) => row.phone || "—",
    },
    {
      id: "receivablesCount",
      header: "Facturas Pendientes",
      align: "center",
      cell: (row) => row.receivablesCount,
    },
    {
      id: "totalOriginalAmount",
      header: "Monto Original Total",
      align: "right",
      cell: (row) => formatCurrencyLocal(row.totalOriginalAmount),
    },
    {
      id: "totalBalance",
      header: "Balance Pendiente",
      align: "right",
      cell: (row) => (
        <span style={{ fontWeight: 600, color: "#e11d48" }}>
          {formatCurrencyLocal(row.totalBalance)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="icon"
            onClick={() => actions.onViewCustomer(row)}
            title="Ver Cuentas"
            style={{ width: "34px", height: "34px", borderRadius: "7px" }}
            className="hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Eye style={{ width: "14px", height: "14px" }} />
          </Button>
        </div>
      ),
    },
  ];
}
