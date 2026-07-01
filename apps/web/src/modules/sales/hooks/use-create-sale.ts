import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { createSale } from "../api/create-sale";
import { saleKeys } from "../query-keys";

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saleKeys.all });
      // El inventario disponible cambió tras la venta.
      void queryClient.invalidateQueries({ queryKey: ["inventories"] });
      void queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo registrar la venta"));
    },
  });
}
