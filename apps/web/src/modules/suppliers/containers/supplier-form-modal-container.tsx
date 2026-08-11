"use client";

import { SupplierForm } from "../components/supplier-form";
import { useCreateSupplier } from "../hooks/use-create-supplier";
import { useUpdateSupplier } from "../hooks/use-update-supplier";
import { mapSupplierDtoToUi } from "../mappers/supplier.mapper";
import {
  mapFormValuesToDto,
  mapSupplierToFormValues,
} from "../mappers/supplier-form.mapper";
import type { SupplierFormSchema } from "../schemas/supplier.schema";
import type { Supplier } from "../types/supplier.types";

interface SupplierFormModalContainerProps {
  supplier: Supplier | null;
  onClose: () => void;
  /** Se ejecuta con el proveedor recién creado, antes de cerrar el modal. */
  onCreated?: (supplier: Supplier) => void;
}

export function SupplierFormModalContainer({
  supplier,
  onClose,
  onCreated,
}: SupplierFormModalContainerProps) {
  const isEditing = Boolean(supplier);
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (values: SupplierFormSchema) => {
    const dto = mapFormValuesToDto(values);
    if (isEditing && supplier) {
      await updateMutation.mutateAsync({ id: supplier.id, data: dto });
    } else {
      const created = await createMutation.mutateAsync(dto);
      onCreated?.(mapSupplierDtoToUi(created));
    }
    onClose();
  };

  return (
    <SupplierForm
      isEditing={isEditing}
      defaultValues={mapSupplierToFormValues(supplier)}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
