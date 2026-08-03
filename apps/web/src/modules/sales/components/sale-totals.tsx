"use client";

import { ReceiptText } from "lucide-react";

import { money } from "../utils/format";

interface SaleTotalsProps {
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
}

export function SaleTotals({
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
}: SaleTotalsProps) {
  const hasCredit = creditApplied > 0;

  return (
    <div className="flex flex-col">
      <div className="rounded-xl bg-table-head p-4">
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-head">Subtotal</dt>
            <dd className="font-semibold tabular-nums text-body">
              {money(subtotal)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-head">ITBIS (18%)</dt>
            <dd className="font-semibold tabular-nums text-body">
              {money(itbis)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-card-border pt-2.5">
            <dt className="font-bold text-body">Total</dt>
            <dd className="text-2xl font-extrabold tabular-nums text-green-text">
              {money(total)}
            </dd>
          </div>
          {hasCredit && (
            <>
              <div className="flex justify-between">
                <dt className="text-green-text">Nota de crédito</dt>
                <dd className="font-semibold tabular-nums text-green-text">
                  −{money(creditApplied)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-card-border pt-2.5">
                <dt className="font-bold text-body">Monto a pagar</dt>
                <dd className="text-xl font-extrabold tabular-nums text-primary">
                  {money(amountPayable)}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || submitting}
        className="mt-3.5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ReceiptText className="h-4 w-4" />
        {submitting ? "Generando…" : "Generar Factura"}
      </button>
      {disabled && disabledHint ? (
        <p className="mt-2 text-center text-xs text-danger">{disabledHint}</p>
      ) : null}
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg border border-card-border text-sm font-semibold text-head transition-colors hover:text-primary disabled:opacity-50"
      >
        Cancelar
      </button>
    </div>
  );
}
