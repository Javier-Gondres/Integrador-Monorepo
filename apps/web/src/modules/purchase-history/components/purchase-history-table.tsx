import { Eye, MapPin } from "lucide-react";

import {
  avatarColor,
  initials,
  money,
} from "@/modules/purchase-orders/utils/format";
import type { DataTableColumn } from "@/shared/data-table";

import type { PurchaseListDto } from "../types/purchase-history.types";
import { formatDate } from "../utils/format-date";

interface PurchaseHistoryActions {
  onViewDetail: (purchase: PurchaseListDto) => void;
}

export function getPurchaseHistoryColumns(
  actions: PurchaseHistoryActions,
): DataTableColumn<PurchaseListDto>[] {
  return [
    {
      id: "date",
      header: "Fecha",
      align: "left",
      cell: (purchase) => {
        const { day, time } = formatDate(purchase.createdAt);
        return (
          <div>
            <div className="font-semibold text-body">{day}</div>
            <div className="text-xs text-muted">
              {time} · {purchase.id}
            </div>
          </div>
        );
      },
    },
    {
      id: "branch",
      header: "Sucursal",
      align: "left",
      cell: (purchase) => (
        <span className="inline-flex items-center gap-1.5 text-body">
          <MapPin className="h-4 w-4 text-muted" />
          {purchase.branch.name}
        </span>
      ),
    },
    {
      id: "supplier",
      header: "Proveedor",
      align: "left",
      cell: (purchase) => (
        <span className="inline-flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: avatarColor(purchase.supplier.id) }}
          >
            {initials(purchase.supplier.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-body">
              {purchase.supplier.name}
            </span>
            <span className="block truncate text-xs text-muted">
              {purchase.supplier.contactName ?? "Sin contacto"}
            </span>
          </span>
        </span>
      ),
    },
    {
      id: "total",
      header: "Total",
      align: "right",
      cell: (purchase) => (
        <div>
          <div className="font-bold tabular-nums text-body">
            {money(purchase.total)}
          </div>
          <div className="text-xs text-muted">
            {purchase.itemsCount}{" "}
            {purchase.itemsCount === 1 ? "producto" : "productos"} ·{" "}
            {purchase.totalUnits} und
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Acción",
      align: "center",
      cell: (purchase) => (
        <button
          type="button"
          onClick={() => actions.onViewDetail(purchase)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-white px-3 py-1.5 text-xs font-semibold text-head transition-colors hover:border-primary hover:text-primary"
        >
          <Eye className="h-3.5 w-3.5" />
          Ver detalle
        </button>
      ),
    },
  ];
}
