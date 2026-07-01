import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { createAdjustment } from "../api/create-adjustment";
import { adjustmentKeys } from "../query-keys";

export function useCreateAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdjustment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adjustmentKeys.all });
      // El ajuste cambia el stock físico: refrescar la disponibilidad en ventas.
      void queryClient.invalidateQueries({ queryKey: ["inventories"] });
      void queryClient.invalidateQueries({ queryKey: ["sales", "products"] });
      toast.success("Ajuste de inventario registrado");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo registrar el ajuste"));
    },
  });
}
