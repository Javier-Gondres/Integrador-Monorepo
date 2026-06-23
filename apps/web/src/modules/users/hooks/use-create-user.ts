import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { createUser } from "../api/create-user";
import { userKeys } from "../query-keys";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Usuario creado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo crear el usuario"));
    },
  });
}
