import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";
import { inventoryKeys } from "@/modules/inventories/query-keys";
import { saleKeys } from "@/modules/sales/query-keys";

import { createReturn } from "../api/create-return";
import { returnKeys } from "../query-keys";

export function useCreateReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReturn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: returnKeys.all });
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      void queryClient.invalidateQueries({ queryKey: saleKeys.allProducts });
      toast.success("Devolución registrada correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo registrar la devolución"));
    },
  });
}
