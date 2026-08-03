"use client";

import { Printer } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";

import { computeLineSubtotal, type SaleLine } from "../hooks/use-sale";
import { money } from "../utils/format";

interface SaleConfirmModalProps {
  lines: SaleLine[];
  customerName: string;
  subtotal: number;
  itbis: number;
  total: number;
  creditApplied: number;
  amountPayable: number;
  submitting: boolean;
  onConfirm: (print: boolean) => void;
  onClose: () => void;
}

/**
 * Panel de confirmación que se muestra antes de registrar la factura. Presenta
 * las líneas seleccionadas y los totales (subtotal, ITBIS, total) en un tamaño
 * de texto ampliado, y ofrece registrar la venta con o sin impresión.
 */
export function SaleConfirmModal({
  lines,
  customerName,
  subtotal,
  itbis,
  total,
  creditApplied,
  amountPayable,
  submitting,
  onConfirm,
  onClose,
}: SaleConfirmModalProps) {
  const hasCredit = creditApplied > 0;

  return (
    <Modal
      title="Confirmar Factura"
      description={
        customerName
          ? `Revisa el detalle de la venta para ${customerName}.`
          : "Revisa el detalle de la venta antes de registrarla."
      }
      onClose={onClose}
      maxWidth="720px"
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full text-base">
          <thead className="sticky top-0 z-10 bg-table-head text-xl text-head">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">Descripción</th>
              <th className="px-3 py-3 text-center font-semibold">Cantidad</th>
              <th className="px-3 py-3 text-right font-semibold">
                Precio Unit.
              </th>
              <th className="px-5 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr
                key={line.product.id}
                className="border-b border-divider last:border-0"
              >
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-xl text-body">
                    {line.product.name}
                  </p>
                  <p className="text-xl text-muted">{line.product.code}</p>
                </td>
                <td className="px-3 py-3.5 text-xl text-center font-semibold tabular-nums text-body">
                  {line.quantity}
                </td>
                <td className="px-3 py-3.5 text-xl text-right tabular-nums text-body">
                  {money(line.product.finalPrice)}
                </td>
                <td className="px-5 py-3.5 text-xl text-right font-semibold tabular-nums text-body">
                  {money(computeLineSubtotal(line.product, line.quantity))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-divider p-5">
        <dl className="ml-auto flex max-w-xs flex-col gap-2 text-base">
          <div className="flex justify-between">
            <dt className="text-head">Subtotal</dt>
            <dd className="font-semibold text-xl tabular-nums text-body">
              {money(subtotal)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-head">ITBIS (18%)</dt>
            <dd className="font-semibold text-xl tabular-nums text-body">
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

      <div className="flex flex-wrap justify-end gap-2.5 border-t border-divider p-5">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button onClick={() => onConfirm(false)} disabled={submitting}>
          {submitting ? "Registrando…" : "Registrar"}
        </Button>
        <Button onClick={() => onConfirm(true)} disabled={submitting}>
          <Printer style={{ width: "16px", height: "16px" }} />
          {submitting ? "Registrando…" : "Registrar e Imprimir"}
        </Button>
      </div>
    </Modal>
  );
}
