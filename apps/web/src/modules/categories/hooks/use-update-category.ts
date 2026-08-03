import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { updateCategory } from "../api/update-category";
import { categoryKeys } from "../query-keys";
import type { CategoryFormValues } from "../types/category.types";

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormValues }) =>
      updateCategory(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Categoría actualizada correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo actualizar la categoría"));
    },
  });
}
