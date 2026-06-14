import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { deleteDiscount } from "../api/delete-discount";
import { discountKeys } from "../query-keys";

export function useDeleteDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDiscount(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: discountKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo eliminar el descuento"));
    },
  });
}
