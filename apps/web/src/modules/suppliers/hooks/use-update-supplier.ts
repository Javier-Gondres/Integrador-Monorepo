import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { updateSupplier } from "../api/update-supplier";
import { supplierKeys } from "../query-keys";
import type { SupplierFormValues } from "../types/supplier.types";

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierFormValues }) =>
      updateSupplier(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success("Proveedor actualizado correctamente");
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "No se pudo actualizar el proveedor"),
      );
    },
  });
}
