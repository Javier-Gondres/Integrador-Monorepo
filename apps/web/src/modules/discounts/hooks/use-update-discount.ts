import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  });
}
