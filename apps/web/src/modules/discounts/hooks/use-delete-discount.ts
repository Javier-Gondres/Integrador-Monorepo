import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteDiscount } from "../api/delete-discount";
import { discountKeys } from "../query-keys";

export function useDeleteDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDiscount(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: discountKeys.all });
    },
  });
}
