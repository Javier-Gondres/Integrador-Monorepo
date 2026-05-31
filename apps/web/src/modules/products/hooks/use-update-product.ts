import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { updateProduct } from "../api/update-product";
import { productKeys } from "../query-keys";
import type { ProductFormValues } from "../types/product.types";

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormValues }) =>
      updateProduct(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Producto actualizado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo actualizar el producto"));
    },
  });
}
