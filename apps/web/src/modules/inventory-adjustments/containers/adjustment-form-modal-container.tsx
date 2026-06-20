"use client";

import type { BranchListItem } from "@/modules/branches/types/branch.types";
import { ProductComboboxContainer } from "@/modules/inventories/containers/product-combobox-container";

import { AdjustmentForm } from "../components/adjustment-form";
import { useCreateAdjustment } from "../hooks/use-create-adjustment";
import type { AdjustmentFormSchema } from "../schemas/adjustment-form.schema";

interface AdjustmentFormModalContainerProps {
  defaultBranchId: string;
  branches: BranchListItem[];
  branchesLoading: boolean;
  onClose: () => void;
}

export function AdjustmentFormModalContainer({
  defaultBranchId,
  branches,
  branchesLoading,
  onClose,
}: AdjustmentFormModalContainerProps) {
  const createMutation = useCreateAdjustment();

  const handleSubmit = async (values: AdjustmentFormSchema) => {
    await createMutation.mutateAsync({
      branchId: values.branchId,
      productId: values.productId,
      quantity: values.quantity,
      adjustmentReason: values.adjustmentReason,
      notes: values.notes?.trim() || undefined,
    });
    onClose();
  };

  return (
    <AdjustmentForm
      defaultBranchId={defaultBranchId}
      branches={branches}
      branchesLoading={branchesLoading}
      isSubmitting={createMutation.isPending}
      onSubmit={handleSubmit}
      onClose={onClose}
      renderProductCombobox={({ selected, onChange }) => (
        <ProductComboboxContainer selected={selected} onChange={onChange} />
      )}
    />
  );
}
