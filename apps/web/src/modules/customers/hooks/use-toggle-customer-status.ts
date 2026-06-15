import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import {
  activateCustomer,
  deactivateCustomer,
} from "../api/toggle-customer-status";
import { customerKeys } from "../query-keys";

export function useToggleCustomerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? deactivateCustomer(id) : activateCustomer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success("Estado del cliente actualizado correctamente");
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "No se pudo cambiar el estado del cliente"),
      );
    },
  });
}
