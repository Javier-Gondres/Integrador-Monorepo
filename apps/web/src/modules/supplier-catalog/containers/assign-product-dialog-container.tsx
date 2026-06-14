"use client";

import { AssignProductDialog } from "../components/assign-product-dialog";
import { useAssignProduct } from "../hooks/use-assign-product";
import type { AssignProductSchema } from "../schemas/assign-product.schema";
import { ProductComboboxContainer } from "./product-combobox-container";

interface AssignProductDialogContainerProps {
  supplierId: string;
  supplierName: string;
  onClose: () => void;
}

export function AssignProductDialogContainer({
  supplierId,
  supplierName,
  onClose,
}: AssignProductDialogContainerProps) {
  const assignMutation = useAssignProduct(supplierId);

  const handleSubmit = async (values: AssignProductSchema) => {
    const trimmed = values.lastCost?.trim();
    const lastCost = trimmed ? Number(trimmed) : undefined;

    await assignMutation.mutateAsync({ productId: values.productId, lastCost });
    onClose();
  };

  return (
    <AssignProductDialog
      supplierName={supplierName}
      isSubmitting={assignMutation.isPending}
      onSubmit={handleSubmit}
      onClose={onClose}
      renderProductCombobox={({ selected, onChange }) => (
        <ProductComboboxContainer
          excludeSupplierId={supplierId}
          selected={selected}
          onChange={onChange}
        />
      )}
    />
  );
}
