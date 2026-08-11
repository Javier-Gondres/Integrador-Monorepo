import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { updatePlatformCompany } from "../api/update-platform-company";
import { platformKeys } from "../query-keys";
import type { UpdatePlatformCompanyPayload } from "../types/platform.types";

export function useUpdatePlatformCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePlatformCompanyPayload;
    }) => updatePlatformCompany(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.all });
      toast.success("Empresa actualizada correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo actualizar la empresa"));
    },
  });
}
