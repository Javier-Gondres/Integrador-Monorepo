import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import {
  activateUser,
  deactivateUser,
} from "../api/toggle-user-status";
import { userKeys } from "../query-keys";

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? deactivateUser(id) : activateUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo cambiar el estado"));
    },
  });
}
