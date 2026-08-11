import { Eye, MapPin, Monitor } from "lucide-react";

import {
  avatarColor,
  initials,
  money,
} from "@/modules/purchase-orders/utils/format";
import type { DataTableColumn } from "@/shared/data-table";
import { Badge } from "@/shared/ui";

import type { SaleListDto } from "../types/sales-history.types";
import { formatDate } from "../utils/format-date";
import { saleStatusMeta } from "../utils/sale-status";

interface SalesHistoryActions {
  onViewDetail: (sale: SaleListDto) => void;
}

export function getSalesHistoryColumns(
  actions: SalesHistoryActions,
): DataTableColumn<SaleListDto>[] {
  return [
    {
      id: "date",
      header: "Fecha",
      align: "left",
      cell: (sale) => {
        const { day, time } = formatDate(sale.createdAt);
        return (
          <div>
            <div className="font-semibold text-body">{day}</div>
            <div className="text-xs text-muted">{time}</div>
          </div>
        );
      },
    },
    {
      id: "branch",
      header: "Sucursal",
      align: "left",
      cell: (sale) => (
        <span className="inline-flex items-center gap-1.5 text-body">
          <MapPin className="h-4 w-4 text-muted" />
          {sale.branchName}
        </span>
      ),
    },
    {
      id: "cashier",
      header: "Cajero",
      align: "left",
      cell: (sale) => {
        const name = sale.cashierName ?? "—";
        return (
          <span className="inline-flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: avatarColor(sale.cashierName ?? sale.id) }}
            >
              {sale.cashierName ? initials(name) : "?"}
            </span>
            <span className="min-w-0 truncate font-semibold text-body">
              {name}
            </span>
          </span>
        );
      },
    },
    {
      id: "cashRegister",
      header: "Caja",
      align: "left",
      cell: (sale) => (
        <span className="inline-flex items-center gap-1.5 text-body">
          <Monitor className="h-4 w-4 text-muted" />
          {sale.cashRegisterName ?? "—"}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Cliente",
      align: "left",
      cell: (sale) => (
        <span className="text-body">
          {sale.customerName ?? "Consumidor final"}
        </span>
      ),
    },
    {
      id: "ncf",
      header: "NCF",
      align: "left",
      cell: (sale) => (
        <div>
          <div className="font-mono text-sm font-semibold text-body">
            {sale.ncf ?? "—"}
          </div>
          {sale.ncfType && (
            <div className="text-xs text-muted">{sale.ncfType}</div>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Estado",
      align: "left",
      cell: (sale) => {
        const { label, variant } = saleStatusMeta(sale.status);
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      id: "total",
      header: "Total",
      align: "right",
      cell: (sale) => {
        const hasCredit = sale.creditApplied > 0;
        return (
          <div>
            <div
              className={
                hasCredit
                  ? "text-xs tabular-nums text-muted line-through"
                  : "font-bold tabular-nums text-body"
              }
            >
              {money(sale.total)}
            </div>
            {hasCredit && (
              <>
                <div className="text-xs tabular-nums text-green-text">
                  −{money(sale.creditApplied)} NC
                </div>
                <div className="font-bold tabular-nums text-body">
                  {money(sale.amountPayable)}
                </div>
              </>
            )}
            <div className="text-xs text-muted">
              {sale.itemsCount}{" "}
              {sale.itemsCount === 1 ? "producto" : "productos"}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Acción",
      align: "center",
      cell: (sale) => (
        <button
          type="button"
          onClick={() => actions.onViewDetail(sale)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-white px-3 py-1.5 text-xs font-semibold text-head transition-colors hover:border-primary hover:text-primary"
        >
          <Eye className="h-3.5 w-3.5" />
          Ver detalle
        </button>
      ),
    },
  ];
}
