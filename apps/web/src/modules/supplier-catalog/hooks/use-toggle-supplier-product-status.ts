import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import {
  activateSupplierProduct,
  deactivateSupplierProduct,
} from "../api/toggle-supplier-product-status";
import { supplierCatalogKeys } from "../query-keys";

export function useToggleSupplierProductStatus(supplierId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      isActive,
    }: {
      productId: string;
      isActive: boolean;
    }) =>
      isActive
        ? deactivateSupplierProduct(supplierId, productId)
        : activateSupplierProduct(supplierId, productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierCatalogKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo cambiar el estado"));
    },
  });
}
