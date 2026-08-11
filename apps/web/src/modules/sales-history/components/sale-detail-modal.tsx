import { Package, Printer } from "lucide-react";

import { printInvoiceReceipt } from "@/modules/invoice-print/utils/print-invoice";
import { money } from "@/modules/purchase-orders/utils/format";
import type { SaleDetailDto } from "@/modules/sales/types/sale.types";
import { Modal } from "@/shared/ui";

import { formatDate } from "../utils/format-date";

interface SaleDetailModalProps {
  sale: SaleDetailDto | undefined;
  loading: boolean;
  fallbackTitle: string;
  onClose: () => void;
}

export function SaleDetailModal({
  sale,
  loading,
  fallbackTitle,
  onClose,
}: SaleDetailModalProps) {
  const title = sale
    ? (sale.customerName ?? sale.ncf ?? fallbackTitle)
    : fallbackTitle;

  const subtitle = sale
    ? (() => {
        const { day, time } = formatDate(sale.createdAt);
        return `${sale.branch.name} · ${day}, ${time}`;
      })()
    : "Cargando…";

  return (
    <Modal
      title={title}
      description={subtitle}
      onClose={onClose}
      maxWidth="640px"
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading || !sale ? (
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
                  Precio
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold tracking-wide text-head uppercase">
                  Importe
                </th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item) => (
                <tr key={item.id} className="border-b border-divider">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Package className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-body">
                          {item.name}
                        </div>
                        <div className="truncate text-xs text-muted">
                          {item.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-sm font-semibold tabular-nums text-body">
                    {item.quantity}
                  </td>
                  <td className="px-5 py-3 text-right text-sm tabular-nums text-body">
                    {money(item.unitPrice)}
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

      {sale && (
        <div className="flex items-end justify-between gap-4 border-t border-divider p-5">
          <button
            type="button"
            onClick={() => printInvoiceReceipt(sale.id)}
            className="inline-flex items-center gap-2 rounded-lg border border-card-border px-4 py-2 text-sm font-semibold text-body transition hover:bg-table-head"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
          <div className="max-w-xs space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-head">
              <span>Subtotal</span>
              <b className="tabular-nums text-body">{money(sale.subtotal)}</b>
            </div>
            <div className="flex items-center justify-between text-head">
              <span>ITBIS (18%)</span>
              <b className="tabular-nums text-body">{money(sale.taxAmount)}</b>
            </div>
            <div className="flex items-center justify-between border-t border-divider pt-2 text-base">
              <span className="font-semibold text-body">Total</span>
              <b className="tabular-nums text-body">{money(sale.total)}</b>
            </div>
            {sale.creditNotesApplied.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between text-green-text"
              >
                <span className="truncate">
                  Nota de crédito {note.ncf ?? ""}
                </span>
                <b className="tabular-nums whitespace-nowrap">
                  −{money(note.amount)}
                </b>
              </div>
            ))}
            {sale.creditApplied > 0 && (
              <div className="flex items-center justify-between border-t border-divider pt-2 text-base">
                <span className="font-semibold text-body">Monto a pagar</span>
                <b className="tabular-nums text-primary">
                  {money(sale.amountPayable)}
                </b>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
