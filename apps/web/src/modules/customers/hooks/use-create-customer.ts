import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { createCustomer } from "../api/create-customer";
import { customerKeys } from "../query-keys";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success("Cliente creado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo crear el cliente"));
    },
  });
}
