import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import {
  activateInventory,
  deactivateInventory,
} from "../api/toggle-inventory-status";
import { inventoryKeys } from "../query-keys";

export function useToggleInventoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? deactivateInventory(id) : activateInventory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo cambiar el estado"));
    },
  });
}
