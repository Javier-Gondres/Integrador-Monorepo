import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { deleteUser } from "../api/delete-user";
import { userKeys } from "../query-keys";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Usuario eliminado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo eliminar el usuario"));
    },
  });
}
