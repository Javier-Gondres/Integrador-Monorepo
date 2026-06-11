import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { updateInventory } from "../api/update-inventory";
import { inventoryKeys } from "../query-keys";
import type { UpdateInventoryValues } from "../types/inventory.types";

export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryValues }) =>
      updateInventory(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success("Inventario actualizado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo actualizar el inventario"));
    },
  });
}
