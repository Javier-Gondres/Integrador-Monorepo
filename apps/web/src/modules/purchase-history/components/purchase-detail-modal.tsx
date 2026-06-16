import { Package } from "lucide-react";

import type { PurchaseDetailDto } from "@/modules/purchase-orders/types/purchase-order.types";
import { money } from "@/modules/purchase-orders/utils/format";
import { Modal } from "@/shared/ui";

import { formatDate } from "../utils/format-date";

interface PurchaseDetailModalProps {
  purchase: PurchaseDetailDto | undefined;
  loading: boolean;
  fallbackTitle: string;
  onClose: () => void;
}

export function PurchaseDetailModal({
  purchase,
  loading,
  fallbackTitle,
  onClose,
}: PurchaseDetailModalProps) {
  const subtitle = purchase
    ? (() => {
        const { day, time } = formatDate(purchase.createdAt);
        return `${purchase.branch.name} · ${day}, ${time}`;
      })()
    : "Cargando…";

  return (
    <Modal
      title={purchase?.supplier.name ?? fallbackTitle}
      description={subtitle}
      onClose={onClose}
      maxWidth="640px"
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading || !purchase ? (
          <div className="p-10 text-center text-sm text-muted">
            Cargando detalle…
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-table-head">
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-head uppercase">
                  Producto
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold tracking-wide text-head uppercase">
                  Cant.
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold tracking-wide text-head uppercase">
                  Costo
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold tracking-wide text-head uppercase">
                  Importe
                </th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((item) => (
                <tr key={item.id} className="border-b border-divider">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Package className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-body">
                          {item.product.name}
                        </div>
                        <div className="truncate text-xs text-muted">
                          {item.product.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-sm font-semibold tabular-nums text-body">
                    {item.quantity}
                  </td>
                  <td className="px-5 py-3 text-right text-sm tabular-nums text-body">
                    {money(item.unitCost)}
                  </td>
                  <td className="px-5 py-3 text-right text-sm tabular-nums text-body">
                    {money(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {purchase && (
        <div className="border-t border-divider p-5">
          <div className="ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-head">
              <span>Subtotal</span>
              <b className="tabular-nums text-body">{money(purchase.subtotal)}</b>
            </div>
            <div className="flex items-center justify-between text-head">
              <span>ITBIS (18%)</span>
              <b className="tabular-nums text-body">
                {money(purchase.taxAmount)}
              </b>
            </div>
            <div className="flex items-center justify-between border-t border-divider pt-2 text-base">
              <span className="font-semibold text-body">Total</span>
              <b className="tabular-nums text-body">{money(purchase.total)}</b>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
