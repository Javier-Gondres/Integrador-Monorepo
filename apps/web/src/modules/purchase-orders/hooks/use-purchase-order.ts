"use client";

import { useCallback, useState } from "react";

export const ITBIS_RATE = 0.18;

/** Datos del producto que la orden necesita mostrar y enviar. */
export interface OrderProduct {
  id: string;
  code: string;
  name: string;
  price: number;
}

export interface OrderLine {
  product: OrderProduct;
  quantity: number;
  unitCost: number;
}

export type OrderLines = Record<string, OrderLine>;

/**
 * Lógica de armado de la orden. Estricto: una orden = un proveedor, por lo que
 * cambiar de proveedor o sucursal debe llamar a `reset`. `lines` mapea
 * productId -> { product, quantity, unitCost }.
 */
export function usePurchaseOrder() {
  const [lines, setLines] = useState<OrderLines>({});

  const reset = useCallback(() => setLines({}), []);

  const add = useCallback((product: OrderProduct, unitCost: number) => {
    setLines((prev) => {
      const existing = prev[product.id];
      if (existing) {
        return {
          ...prev,
          [product.id]: { ...existing, quantity: existing.quantity + 1 },
        };
      }
      return { ...prev, [product.id]: { product, quantity: 1, unitCost } };
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

  const setUnitCost = useCallback((productId: string, unitCost: number) => {
    setLines((prev) =>
      prev[productId]
        ? { ...prev, [productId]: { ...prev[productId], unitCost } }
        : prev,
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  const productIds = Object.keys(lines);
  const lineList = Object.values(lines);
  const subtotal = lineList.reduce(
    (sum, line) => sum + line.quantity * line.unitCost,
    0,
  );
  const itbis = subtotal * ITBIS_RATE;
  const total = subtotal + itbis;
  const totalUnits = lineList.reduce((sum, line) => sum + line.quantity, 0);

  return {
    lines,
    productIds,
    add,
    setQuantity,
    setUnitCost,
    remove,
    reset,
    subtotal,
    itbis,
    total,
    totalUnits,
  };
}
