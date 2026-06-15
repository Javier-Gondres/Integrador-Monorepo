import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { updateCustomer } from "../api/update-customer";
import { customerKeys } from "../query-keys";
import type { CustomerFormValues } from "../types/customer.types";

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerFormValues }) =>
      updateCustomer(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success("Cliente actualizado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo actualizar el cliente"));
    },
  });
}
