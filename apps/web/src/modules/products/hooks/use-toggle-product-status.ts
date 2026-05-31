import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import {
  activateProduct,
  deactivateProduct,
} from "../api/toggle-product-status";
import { productKeys } from "../query-keys";

export function useToggleProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? deactivateProduct(id) : activateProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo cambiar el estado"));
    },
  });
}
