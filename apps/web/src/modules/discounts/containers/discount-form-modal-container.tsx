"use client";

import { DiscountForm } from "../components/discount-form";
import { useCreateDiscount } from "../hooks/use-create-discount";
import { useUpdateDiscount } from "../hooks/use-update-discount";
import {
  mapDiscountToFormValues,
  mapFormValuesToDto,
} from "../mappers/discount-form.mapper";
import type { DiscountFormSchema } from "../schemas/discount.schema";
import type { Discount } from "../types/discount.types";
import { EntitySelectorContainer } from "./entity-selector-container";

interface DiscountFormModalContainerProps {
  discount: Discount | null;
  onClose: () => void;
}

export function DiscountFormModalContainer({
  discount,
  onClose,
}: DiscountFormModalContainerProps) {
  const isEditing = Boolean(discount);
  const createMutation = useCreateDiscount();
  const updateMutation = useUpdateDiscount();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (values: DiscountFormSchema) => {
    const dto = mapFormValuesToDto(values);
    if (isEditing && discount) {
      await updateMutation.mutateAsync({ id: discount.id, data: dto });
    } else {
      await createMutation.mutateAsync(dto);
    }
    onClose();
  };

  return (
    <DiscountForm
      isEditing={isEditing}
      defaultValues={mapDiscountToFormValues(discount)}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={onClose}
      renderCategorySelector={({ selectedIds, onChange }) => (
        <EntitySelectorContainer
          entityType="category"
          label="Categorías aplicables"
          placeholder="Seleccionar categorías..."
          searchPlaceholder="Buscar categoría..."
          emptyMessage="No se encontraron categorías"
          selectedIds={selectedIds}
          onChange={onChange}
        />
      )}
      renderProductSelector={({ selectedIds, onChange }) => (
        <EntitySelectorContainer
          entityType="product"
          label="Productos aplicables"
          placeholder="Seleccionar productos..."
          searchPlaceholder="Buscar producto..."
          emptyMessage="No se encontraron productos"
          selectedIds={selectedIds}
          onChange={onChange}
        />
      )}
      renderExcludedProductSelector={({ selectedIds, onChange }) => (
        <EntitySelectorContainer
          entityType="product"
          label="Productos excluidos"
          placeholder="Seleccionar productos excluidos..."
          searchPlaceholder="Buscar producto a excluir..."
          emptyMessage="No se encontraron productos"
          selectedIds={selectedIds}
          onChange={onChange}
        />
      )}
    />
  );
}
