"use client";

import { Trash2 } from "lucide-react";

import { computeLineSubtotal, type SaleLine } from "../hooks/use-sale";
import { money } from "../utils/format";
import { QuantityStepper } from "./quantity-stepper";

interface SaleCartProps {
  lines: SaleLine[];
  onSetQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

/** Tabla de líneas del carrito. El encabezado y el estado vacío viven en SaleDetail. */
export function SaleCart({ lines, onSetQuantity, onRemove }: SaleCartProps) {
  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 z-10 bg-table-head text-xs text-head">
        <tr>
          <th className="px-4 py-2.5 text-left font-semibold">Descripción</th>
          <th className="px-2 py-2.5 text-center font-semibold">Cantidad</th>
          <th className="px-2 py-2.5 text-center font-semibold">Stock</th>
          <th className="px-2 py-2.5 text-right font-semibold">Precio Unit.</th>
          <th className="px-2 py-2.5 text-right font-semibold">Total</th>
          <th className="px-4 py-2.5" />
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => (
          <tr
            key={line.product.id}
            className="border-b border-divider last:border-0"
          >
            <td className="px-4 py-3">
              <p className="font-semibold text-body">{line.product.name}</p>
              <p className="text-xs text-muted">{line.product.code}</p>
            </td>
            <td className="px-2 py-3 text-center">
              <QuantityStepper
                value={line.quantity}
                max={line.product.available}
                onChange={(value) => onSetQuantity(line.product.id, value)}
              />
            </td>
            <td className="px-2 py-3 text-center tabular-nums text-body">
              {line.product.available}
            </td>
            <td className="px-2 py-3 text-right tabular-nums text-body">
              {money(line.product.finalPrice)}
            </td>
            <td className="px-2 py-3 text-right font-semibold tabular-nums text-body">
              {money(computeLineSubtotal(line.product, line.quantity))}
            </td>
            <td className="px-4 py-3 text-right">
              <button
                type="button"
                aria-label="Quitar"
                onClick={() => onRemove(line.product.id)}
                className="text-muted transition-colors hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
