import { Permission } from "@repo/shared";
import { Check, ShoppingCart, Trash2, X } from "lucide-react";

import { Can } from "@/shared/ui/can";

import type { OrderLines } from "../hooks/use-purchase-order";
import { money } from "../utils/format";
import { QuantityStepper } from "./quantity-stepper";

interface OrderPanelProps {
  lines: OrderLines;
  productIds: string[];
  subtotal: number;
  itbis: number;
  total: number;
  totalUnits: number;
  supplierName: string | null;
  onSetQuantity: (productId: string, quantity: number) => void;
  onSetUnitCost: (productId: string, unitCost: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

export function OrderPanel({
  lines,
  productIds,
  subtotal,
  itbis,
  total,
  totalUnits,
  supplierName,
  onSetQuantity,
  onSetUnitCost,
  onRemove,
  onClear,
  onConfirm,
  submitting,
}: OrderPanelProps) {
  const isEmpty = productIds.length === 0;

  return (
    <div className="flex min-h-0 flex-col bg-[#FBFCFE]">
      <div className="flex items-center gap-3 border-b border-card-border p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShoppingCart className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-body">Orden de compra</div>
          <div className="text-xs text-muted">
            {totalUnits} {totalUnits === 1 ? "unidad" : "unidades"} ·{" "}
            {productIds.length}{" "}
            {productIds.length === 1 ? "producto" : "productos"}
          </div>
        </div>
        {!isEmpty && (
          <button
            type="button"
            title="Vaciar"
            onClick={onClear}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-head transition-colors hover:bg-danger-bg hover:text-danger"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-8 text-center">
          <ShoppingCart className="mb-3 h-8 w-8 text-muted" />
          <div className="text-sm font-semibold text-body">
            La orden está vacía
          </div>
          <div className="text-xs text-muted">
            {supplierName
              ? `Agrega productos del catálogo de ${supplierName}.`
              : "Selecciona un proveedor y agrega productos."}
          </div>
        </div>
      ) : (
        <>
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-3">
            {productIds.map((id) => {
              const line = lines[id];
              if (!line) return null;
              return (
                <div
                  key={id}
                  className="mb-2 rounded-xl border border-card-border bg-white p-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-body">
                        {line.product.name}
                      </div>
                      <div className="truncate text-xs text-muted">
                        {line.product.code}
                      </div>
                    </div>
                    <button
                      type="button"
                      title="Quitar"
                      onClick={() => onRemove(id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-head transition-colors hover:bg-danger-bg hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-end justify-between gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-head uppercase">
                        Costo unit.
                      </span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.unitCost}
                        onChange={(e) => {
                          const parsed = parseFloat(e.target.value);
                          onSetUnitCost(
                            id,
                            Number.isFinite(parsed) ? parsed : 0,
                          );
                        }}
                        className="h-8 w-24 rounded-lg border border-input-border px-2 text-sm tabular-nums text-body outline-none focus:border-primary"
                      />
                    </label>
                    <QuantityStepper
                      value={line.quantity}
                      onChange={(quantity) => onSetQuantity(id, quantity)}
                    />
                  </div>

                  <div className="mt-2 text-right text-sm font-semibold tabular-nums text-body">
                    {money(line.quantity * line.unitCost)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-card-border p-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-head">
                <span>Subtotal</span>
                <b className="tabular-nums text-body">{money(subtotal)}</b>
              </div>
              <div className="flex items-center justify-between text-head">
                <span>ITBIS (18%)</span>
                <b className="tabular-nums text-body">{money(itbis)}</b>
              </div>
              <div className="flex items-center justify-between border-t border-divider pt-2 text-base">
                <span className="font-semibold text-body">Total</span>
                <b className="tabular-nums text-body">{money(total)}</b>
              </div>
            </div>

            <Can permission={Permission.PURCHASES_CREATE}>
              <button
                type="button"
                onClick={onConfirm}
                disabled={submitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Check className="h-4 w-4" />
                {submitting ? "Registrando…" : "Confirmar orden"}
              </button>
            </Can>
          </div>
        </>
      )}
    </div>
  );
}
