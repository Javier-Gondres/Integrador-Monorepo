import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toggleDiscountStatus } from "../api/toggle-discount-status";
import { discountKeys } from "../query-keys";

export function useToggleDiscountStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleDiscountStatus(id, isActive),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: discountKeys.all });
    },
  });
}
