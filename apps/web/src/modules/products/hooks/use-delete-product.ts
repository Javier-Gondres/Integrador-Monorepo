import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { deleteProduct } from "../api/delete-product";
import { productKeys } from "../query-keys";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Producto eliminado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo eliminar el producto"));
    },
  });
}
