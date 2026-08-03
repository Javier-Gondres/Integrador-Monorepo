import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { createSupplier } from "../api/create-supplier";
import { supplierKeys } from "../query-keys";

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success("Proveedor creado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo crear el proveedor"));
    },
  });
}
