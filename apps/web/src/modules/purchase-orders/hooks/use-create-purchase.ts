import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { createPurchase } from "../api/create-purchase";
import { purchaseKeys } from "../query-keys";

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      // La compra afecta inventario y movimientos: refrescar todo lo relacionado.
      void queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["inventories"] });
      void queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
      void queryClient.invalidateQueries({ queryKey: ["supplier-catalog"] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "products"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo registrar la compra"));
    },
  });
}
