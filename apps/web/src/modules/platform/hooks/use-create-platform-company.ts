import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { createPlatformCompany } from "../api/create-platform-company";
import { platformKeys } from "../query-keys";

export function useCreatePlatformCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlatformCompany,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.all });
      toast.success("Empresa y owner creados correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo crear la empresa"));
    },
  });
}
