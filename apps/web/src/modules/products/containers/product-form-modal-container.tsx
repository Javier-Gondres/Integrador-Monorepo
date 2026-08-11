"use client";

import { useState } from "react";

import { Permission, usePermissions } from "@/modules/auth";
import { CategoryFormModalContainer } from "@/modules/categories/containers/category-form-modal-container";
import type { Category } from "@/modules/categories/types/category.types";

import { ProductForm } from "../components/product-form";
import { useCreateProduct } from "../hooks/use-create-product";
import { useUpdateProduct } from "../hooks/use-update-product";
import { mapProductDtoToUi } from "../mappers/product.mapper";
import {
  mapFormValuesToDto,
  mapProductToFormValues,
} from "../mappers/product-form.mapper";
import type { ProductFormSchema } from "../schemas/product.schema";
import type { Product } from "../types/product.types";
import { CategoryComboboxContainer } from "./category-combobox-container";

interface ProductFormModalContainerProps {
  product: Product | null;
  onClose: () => void;
  /** Se ejecuta tras crear el producto y antes de cerrar el modal. */
  onCreated?: (product: Product) => void | Promise<void>;
  /** Campos adicionales a renderizar dentro del formulario. */
  renderExtraFields?: () => React.ReactNode;
}

export function ProductFormModalContainer({
  product,
  onClose,
  onCreated,
  renderExtraFields,
}: ProductFormModalContainerProps) {
  const isEditing = Boolean(product);
  const { can } = usePermissions();
  const canCreateCategory = can(Permission.CATEGORIES_CREATE);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [isFinishing, setIsFinishing] = useState(false);
  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || isFinishing;
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [newlyCreatedCategory, setNewlyCreatedCategory] =
    useState<Category | null>(null);

  const handleSubmit = async (values: ProductFormSchema) => {
    const dto = mapFormValuesToDto(values);
    if (isEditing && product) {
      await updateMutation.mutateAsync({ id: product.id, data: dto });
    } else {
      const created = await createMutation.mutateAsync(dto);
      setIsFinishing(true);
      try {
        await onCreated?.(mapProductDtoToUi(created));
      } finally {
        setIsFinishing(false);
      }
    }
    onClose();
  };

  return (
    <ProductForm
      isEditing={isEditing}
      defaultValues={mapProductToFormValues(product)}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={onClose}
      renderCategoryCombobox={({ value, onChange }) => (
        <CategoryComboboxContainer
          selectedIds={value}
          onChange={onChange}
          onCreateClick={
            canCreateCategory ? () => setCreateCategoryOpen(true) : undefined
          }
          newlyCreatedCategory={newlyCreatedCategory}
        />
      )}
      renderExtraFields={renderExtraFields}
      renderAuxiliaryModal={() =>
        canCreateCategory && createCategoryOpen ? (
          <CategoryFormModalContainer
            category={null}
            onClose={() => setCreateCategoryOpen(false)}
            onCreated={(category) => {
              setNewlyCreatedCategory(category);
              setCreateCategoryOpen(false);
            }}
          />
        ) : null
      }
    />
  );
}
