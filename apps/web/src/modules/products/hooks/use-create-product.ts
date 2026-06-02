import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { createProduct } from "../api/create-product";
import { productKeys } from "../query-keys";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Producto creado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo crear el producto"));
    },
  });
}
