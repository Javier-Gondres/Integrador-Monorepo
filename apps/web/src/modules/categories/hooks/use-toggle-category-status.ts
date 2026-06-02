import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import {
  activateCategory,
  deactivateCategory,
} from "../api/toggle-category-status";
import { categoryKeys } from "../query-keys";

export function useToggleCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? deactivateCategory(id) : activateCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo cambiar el estado"));
    },
  });
}
