import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";
import { inventoryKeys } from "@/modules/inventories/query-keys";
import { inventoryMovementKeys } from "@/modules/inventory-movements/query-keys";

import { createSale } from "../api/create-sale";
import { saleKeys } from "../query-keys";

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saleKeys.all });
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      void queryClient.invalidateQueries({ queryKey: inventoryMovementKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo registrar la venta"));
    },
  });
}
