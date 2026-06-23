import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { togglePlatformCompanyStatus } from "../api/toggle-platform-company-status";
import { platformKeys } from "../query-keys";

export function useTogglePlatformCompanyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      togglePlatformCompanyStatus(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.all });
      toast.success("Estado de la empresa actualizado");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo actualizar la empresa"));
    },
  });
}
