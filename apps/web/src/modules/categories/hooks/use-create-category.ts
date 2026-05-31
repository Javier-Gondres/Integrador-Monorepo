import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { createCategory } from "../api/create-category";
import { categoryKeys } from "../query-keys";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Categoría creada correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo crear la categoría"));
    },
  });
}
