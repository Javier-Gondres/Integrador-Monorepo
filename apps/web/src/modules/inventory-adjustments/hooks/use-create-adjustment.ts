import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";
import { inventoryKeys } from "@/modules/inventories/query-keys";
import { saleKeys } from "@/modules/sales/query-keys";

import { createAdjustment } from "../api/create-adjustment";
import { adjustmentKeys } from "../query-keys";

export function useCreateAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdjustment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adjustmentKeys.all });
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      void queryClient.invalidateQueries({ queryKey: saleKeys.allProducts });
      toast.success("Ajuste de inventario registrado");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo registrar el ajuste"));
    },
  });
}
