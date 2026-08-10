"use client";

import { useState } from "react";

import { ProductFormModalContainer } from "@/modules/products/containers/product-form-modal-container";
import { Input } from "@/shared/ui/input";

import { useAssignProduct } from "../hooks/use-assign-product";

interface CreateSupplierProductContainerProps {
  supplierId: string;
  supplierName: string;
  onClose: () => void;
}

/**
 * Crea un producto y lo asigna automáticamente al proveedor seleccionado.
 *
 * El backend no acepta un proveedor en `POST /products`, así que son dos
 * llamadas: crear el producto y luego asignarlo al proveedor con el último
 * costo (opcional) que el usuario haya escrito.
 */
export function CreateSupplierProductContainer({
  supplierId,
  supplierName,
  onClose,
}: CreateSupplierProductContainerProps) {
  const [lastCost, setLastCost] = useState("");
  const assignMutation = useAssignProduct(supplierId);

  return (
    <ProductFormModalContainer
      product={null}
      onClose={onClose}
      renderExtraFields={() => (
        <Input
          id="supplier-product-last-cost"
          label={`Último costo de ${supplierName}`}
          type="number"
          min="0"
          step="0.01"
          placeholder="Opcional"
          value={lastCost}
          onChange={(e) => setLastCost(e.target.value)}
        />
      )}
      onCreated={async (product) => {
        const trimmed = lastCost.trim();
        const parsed = trimmed ? Number(trimmed) : undefined;
        const isValidCost =
          parsed !== undefined && Number.isFinite(parsed) && parsed >= 0;

        await assignMutation.mutateAsync({
          productId: product.id,
          lastCost: isValidCost ? parsed : undefined,
        });
      }}
    />
  );
}
