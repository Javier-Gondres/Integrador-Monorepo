import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { updateEmployee } from "../api/update-employee";
import { employeeKeys } from "../query-keys";

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateEmployee>[1];
    }) => updateEmployee(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success("Empleado actualizado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo actualizar el empleado"));
    },
  });
}
