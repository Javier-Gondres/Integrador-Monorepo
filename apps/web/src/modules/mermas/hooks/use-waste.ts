import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { inventoryKeys } from "@/modules/inventories/query-keys";

import { WasteApi } from "../api/waste.api";
import { wasteKeys } from "../query-keys";
import type { CreateWastePayload, WasteFilters } from "../types/waste.types";

export function useWasteQuery(filters: WasteFilters) {
  return useQuery({
    queryKey: wasteKeys.list(filters),
    queryFn: ({ signal }) => WasteApi.getPaginated(filters, signal),
  });
}

export function useCreateWasteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWastePayload) => WasteApi.create(payload),
    onSuccess: () => {
      // Invalidate waste list and inventory list
      queryClient.invalidateQueries({ queryKey: wasteKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
