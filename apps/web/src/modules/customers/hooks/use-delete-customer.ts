import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { deleteCustomer } from "../api/delete-customer";
import { customerKeys } from "../query-keys";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success("Cliente eliminado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo eliminar el cliente"));
    },
  });
}
