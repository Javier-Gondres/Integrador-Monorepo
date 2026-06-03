import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { deleteSupplier } from "../api/delete-supplier";
import { supplierKeys } from "../query-keys";

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success("Proveedor eliminado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo eliminar el proveedor"));
    },
  });
}
