import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { createInventory } from "../api/create-inventory";
import { inventoryKeys } from "../query-keys";

export function useCreateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInventory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success("Producto asignado al inventario");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo asignar el producto"));
    },
  });
}
