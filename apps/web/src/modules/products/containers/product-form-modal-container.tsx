"use client";

import { useState } from "react";

import { CategoryFormModalContainer } from "@/modules/categories/containers/category-form-modal-container";
import type { Category } from "@/modules/categories/types/category.types";

import { ProductForm } from "../components/product-form";
import { useCreateProduct } from "../hooks/use-create-product";
import { useUpdateProduct } from "../hooks/use-update-product";
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
}

export function ProductFormModalContainer({
  product,
  onClose,
}: ProductFormModalContainerProps) {
  const isEditing = Boolean(product);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [newlyCreatedCategory, setNewlyCreatedCategory] =
    useState<Category | null>(null);

  const handleSubmit = async (values: ProductFormSchema) => {
    const dto = mapFormValuesToDto(values);
    if (isEditing && product) {
      await updateMutation.mutateAsync({ id: product.id, data: dto });
    } else {
      await createMutation.mutateAsync(dto);
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
          onCreateClick={() => setCreateCategoryOpen(true)}
          newlyCreatedCategory={newlyCreatedCategory}
        />
      )}
      renderAuxiliaryModal={() =>
        createCategoryOpen ? (
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
