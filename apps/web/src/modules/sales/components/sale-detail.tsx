"use client";

import { CalendarDays, Plus, ShoppingCart, Trash2, X } from "lucide-react";

import type { SaleLine } from "../hooks/use-sale";
import type { CreditNoteDto } from "../types/sale.types";
import { formatSaleDay } from "../utils/format";
import { CreditNotesPanel } from "./credit-notes-panel";
import { SaleCart } from "./sale-cart";
import { SaleTotals } from "./sale-totals";

interface SaleDetailProps {
  lines: SaleLine[];
  qtyTotal: number;
  onSetQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onAddProduct: () => void;

  /** Solo OWNER/ADMIN: permite registrar una venta con fecha pasada. */
  canBackdate: boolean;
  /** Día (`YYYY-MM-DD`) elegido para una venta pasada, o `null`. */
  saleDate: string | null;
  onOpenDateModal: () => void;
  onClearDate: () => void;

  subtotal: number;
  itbis: number;
  total: number;
  creditApplied: number;
  amountPayable: number;
  submitting: boolean;
  disabled: boolean;
  disabledHint?: string | null;
  onSubmit: () => void;
  onCancel: () => void;

  showCreditNotes: boolean;
  creditNotes: CreditNoteDto[];
  selectedCreditNoteIds: string[];
  onToggleCreditNote: (id: string) => void;
  creditNotesLoading: boolean;
}

/**
 * Tarjeta "Detalle de la Venta": encabezado a todo el ancho y, debajo, dos
 * columnas — la tabla del carrito (con scroll propio) junto a la columna de
 * totales (que incluye las notas de crédito). Cuando el carrito está vacío
 * se muestra el estado vacío en toda el área (fiel al diseño Opción A).
 */
export function SaleDetail({
  lines,
  qtyTotal,
  onSetQuantity,
  onRemove,
  onClear,
  onAddProduct,
  canBackdate,
  saleDate,
  onOpenDateModal,
  onClearDate,
  subtotal,
  itbis,
  total,
  creditApplied,
  amountPayable,
  submitting,
  disabled,
  disabledHint,
  onSubmit,
  onCancel,
  showCreditNotes,
  creditNotes,
  selectedCreditNoteIds,
  onToggleCreditNote,
  creditNotesLoading,
}: SaleDetailProps) {
  const empty = lines.length === 0;

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-card-border bg-card shadow-sm">
      <div className="flex flex-none items-center gap-2 border-b border-card-border p-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-body">
          <ShoppingCart className="h-4 w-4 text-primary" />
          Detalle de la Venta
          <span className="text-muted">
            ({qtyTotal} {qtyTotal === 1 ? "artículo" : "artículos"})
          </span>
        </span>
        <span className="grow" />
        {canBackdate &&
          (saleDate ? (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 px-3 text-sm font-semibold text-primary">
              <CalendarDays className="h-3.5 w-3.5" />
              <button
                type="button"
                onClick={onOpenDateModal}
                className="transition-colors hover:underline"
              >
                {formatSaleDay(saleDate)}
              </button>
              <button
                type="button"
                onClick={onClearDate}
                aria-label="Quitar fecha de venta"
                className="transition-colors hover:text-danger"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenDateModal}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-card-border px-3 text-sm font-semibold text-head transition-colors hover:text-primary"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Fecha de venta
            </button>
          ))}
        {!empty && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-card-border px-3 text-sm font-semibold text-danger transition-colors hover:bg-danger/5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpiar todo
          </button>
        )}
        <button
          type="button"
          onClick={onAddProduct}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-card-border px-3 text-sm font-semibold text-head transition-colors hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar Producto
        </button>
      </div>

      {empty ? (
        <div className="grid flex-1 place-items-center p-8 text-center">
          <div>
            <ShoppingCart className="mx-auto h-9 w-9 text-muted" />
            <p className="mt-2 text-sm font-semibold text-body">
              Aún no hay productos
            </p>
            <p className="mt-1 max-w-[240px] text-xs text-muted">
              Busca y agrega productos para construir la factura.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 max-[1024px]:flex-col">
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto max-[1024px]:max-h-[42vh]">
            <SaleCart
              lines={lines}
              onSetQuantity={onSetQuantity}
              onRemove={onRemove}
            />
          </div>

          <div className="flex w-80 flex-none flex-col gap-3 overflow-y-auto border-l border-card-border bg-page/40 p-4 max-[1024px]:w-full max-[1024px]:border-l-0 max-[1024px]:border-t">
            {showCreditNotes && (
              <CreditNotesPanel
                creditNotes={creditNotes}
                selectedIds={selectedCreditNoteIds}
                onToggle={onToggleCreditNote}
                loading={creditNotesLoading}
              />
            )}
            <SaleTotals
              subtotal={subtotal}
              itbis={itbis}
              total={total}
              creditApplied={creditApplied}
              amountPayable={amountPayable}
              submitting={submitting}
              disabled={disabled}
              disabledHint={disabledHint}
              onSubmit={onSubmit}
              onCancel={onCancel}
            />
          </div>
        </div>
      )}
    </section>
  );
}
