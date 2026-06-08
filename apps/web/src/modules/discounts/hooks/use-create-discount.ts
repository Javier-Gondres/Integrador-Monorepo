import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createDiscount } from "../api/create-discount";
import { discountKeys } from "../query-keys";
import type { DiscountFormValuesDto } from "../types/discount.types";

export function useCreateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DiscountFormValuesDto) => createDiscount(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: discountKeys.all });
    },
  });
}