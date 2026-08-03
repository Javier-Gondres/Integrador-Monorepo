"use client";

import { InventoryForm } from "../components/inventory-form";
import { useCreateInventory } from "../hooks/use-create-inventory";
import { useUpdateInventory } from "../hooks/use-update-inventory";
import {
  mapFormValuesToCreateDto,
  mapFormValuesToUpdateDto,
  mapInventoryToFormValues,
  mapInventoryToProductOption,
} from "../mappers/inventory-form.mapper";
import type { InventoryFormSchema } from "../schemas/inventory.schema";
import type { Inventory } from "../types/inventory.types";
import { ProductComboboxContainer } from "./product-combobox-container";

interface InventoryFormModalContainerProps {
  inventory: Inventory | null;
  branchId: string;
  onClose: () => void;
}

export function InventoryFormModalContainer({
  inventory,
  branchId,
  onClose,
}: InventoryFormModalContainerProps) {
  const isEditing = Boolean(inventory);
  const createMutation = useCreateInventory();
  const updateMutation = useUpdateInventory();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (values: InventoryFormSchema) => {
    if (isEditing && inventory) {
      await updateMutation.mutateAsync({
        id: inventory.id,
        data: mapFormValuesToUpdateDto(values),
      });
    } else {
      await createMutation.mutateAsync(
        mapFormValuesToCreateDto(values, branchId),
      );
    }
    onClose();
  };

  return (
    <InventoryForm
      isEditing={isEditing}
      defaultValues={mapInventoryToFormValues(inventory)}
      defaultProduct={mapInventoryToProductOption(inventory)}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={onClose}
      renderProductCombobox={({ selected, onChange }) => (
        <ProductComboboxContainer selected={selected} onChange={onChange} />
      )}
    />
  );
}
