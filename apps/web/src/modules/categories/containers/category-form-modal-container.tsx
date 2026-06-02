"use client";

import { CategoryForm } from "../components/category-form";
import { useCreateCategory } from "../hooks/use-create-category";
import { useUpdateCategory } from "../hooks/use-update-category";
import {
  mapCategoryToFormValues,
  mapFormValuesToDto,
} from "../mappers/category-form.mapper";
import type { CategoryFormSchema } from "../schemas/category.schema";
import type { Category } from "../types/category.types";

interface CategoryFormModalContainerProps {
  category: Category | null;
  onClose: () => void;
}

export function CategoryFormModalContainer({
  category,
  onClose,
}: CategoryFormModalContainerProps) {
  const isEditing = Boolean(category);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (values: CategoryFormSchema) => {
    const dto = mapFormValuesToDto(values);
    if (isEditing && category) {
      await updateMutation.mutateAsync({ id: category.id, data: dto });
    } else {
      await createMutation.mutateAsync(dto);
    }
    onClose();
  };

  return (
    <CategoryForm
      isEditing={isEditing}
      defaultValues={mapCategoryToFormValues(category)}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
