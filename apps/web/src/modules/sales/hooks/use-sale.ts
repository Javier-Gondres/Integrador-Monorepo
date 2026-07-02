"use client";

import { useCallback, useMemo, useState } from "react";

import type { SalePaymentOption, SaleProductDto } from "../types/sale.types";

export const ITBIS_RATE = 0.18;

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Subtotal de una línea (después de descuento), idéntico al cálculo del backend. */
export function computeLineSubtotal(
  product: Pick<SaleProductDto, "price" | "discountPercentage">,
  quantity: number,
): number {
  const perUnitDiscount = round2(
    (product.price * product.discountPercentage) / 100,
  );
  const gross = round2(product.price * quantity);
  const lineDiscount = round2(perUnitDiscount * quantity);
  return round2(gross - lineDiscount);
}

export interface SaleLine {
  product: SaleProductDto;
  quantity: number;
}

export type SaleLines = Record<string, SaleLine>;

export interface SaleCustomer {
  id: string;
  name: string;
  cedula: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

/**
 * Estado local de la venta (factura en construcción): carrito de líneas,
 * cliente seleccionado, método de pago y notas de crédito a redimir. Los totales
 * de mercancía (subtotal, ITBIS, total) se derivan aquí y replican el cálculo del
 * backend para evitar discrepancias de pago. El crédito aplicado y el monto a
 * pagar los compone el contenedor con las notas de crédito disponibles.
 */
export function useSale() {
  const [lines, setLines] = useState<SaleLines>({});
  const [customer, setCustomerState] = useState<SaleCustomer | null>(null);
  const [paymentOption, setPaymentOption] =
    useState<SalePaymentOption>("contado");
  const [selectedCreditNoteIds, setSelectedCreditNoteIds] = useState<string[]>(
    [],
  );

  const add = useCallback((product: SaleProductDto) => {
    setLines((prev) => {
      const existing = prev[product.id];
      if (existing) {
        return {
          ...prev,
          [product.id]: { ...existing, quantity: existing.quantity + 1 },
        };
      }
      return { ...prev, [product.id]: { product, quantity: 1 } };
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[productId];
      } else if (next[productId]) {
        next[productId] = { ...next[productId], quantity };
      }
      return next;
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setLines({}), []);

  const setCustomer = useCallback((next: SaleCustomer | null) => {
    setCustomerState(next);
    // Las notas de crédito pertenecen a un cliente: limpiar selección al cambiar.
    setSelectedCreditNoteIds([]);
  }, []);

  const clearCustomer = useCallback(() => {
    setCustomerState(null);
    setSelectedCreditNoteIds([]);
  }, []);

  const toggleCreditNote = useCallback((id: string) => {
    setSelectedCreditNoteIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  }, []);

  const reset = useCallback(() => {
    setLines({});
    setCustomerState(null);
    setPaymentOption("contado");
    setSelectedCreditNoteIds([]);
  }, []);

  const totals = useMemo(() => {
    const lineList = Object.values(lines);
    const subtotal = round2(
      lineList.reduce(
        (sum, line) => sum + computeLineSubtotal(line.product, line.quantity),
        0,
      ),
    );
    const itbis = round2(subtotal * ITBIS_RATE);
    const total = round2(subtotal + itbis);
    const qtyTotal = lineList.reduce((sum, line) => sum + line.quantity, 0);

    return { subtotal, itbis, total, qtyTotal };
  }, [lines]);

  return {
    lines,
    productIds: Object.keys(lines),
    add,
    setQuantity,
    remove,
    clearCart,
    customer,
    setCustomer,
    clearCustomer,
    paymentOption,
    setPaymentOption,
    selectedCreditNoteIds,
    toggleCreditNote,
    reset,
    ...totals,
  };
}
