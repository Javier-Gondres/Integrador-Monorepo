import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { updateDiscount } from "../api/update-discount";
import { discountKeys } from "../query-keys";
import type { DiscountFormValuesDto } from "../types/discount.types";

export function useUpdateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DiscountFormValuesDto }) =>
      updateDiscount(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: discountKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo actualizar el descuento"));
    },
  });
}
