import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";
import { inventoryKeys } from "@/modules/inventories/query-keys";
import { inventoryMovementKeys } from "@/modules/inventory-movements/query-keys";
import { saleKeys } from "@/modules/sales/query-keys";
import { supplierCatalogKeys } from "@/modules/supplier-catalog/query-keys";

import { createPurchase } from "../api/create-purchase";
import { purchaseKeys } from "../query-keys";

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: inventoryMovementKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: supplierCatalogKeys.all });
      void queryClient.invalidateQueries({ queryKey: saleKeys.allProducts });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo registrar la compra"));
    },
  });
}
