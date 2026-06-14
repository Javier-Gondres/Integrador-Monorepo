import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";
import { supplierKeys } from "@/modules/suppliers/query-keys";

import { assignProduct,type AssignProductPayload } from "../api/assign-product";
import { supplierCatalogKeys } from "../query-keys";

export function useAssignProduct(supplierId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignProductPayload) =>
      assignProduct(supplierId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierCatalogKeys.all });
      void queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success("Producto asignado al proveedor");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo asignar el producto"));
    },
  });
}
