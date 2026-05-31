import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { deleteCategory } from "../api/delete-category";
import { categoryKeys } from "../query-keys";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Categoría eliminada correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo eliminar la categoría"));
    },
  });
}
