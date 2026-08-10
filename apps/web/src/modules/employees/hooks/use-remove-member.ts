import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";
import { userKeys } from "@/modules/users/query-keys";
import type { User } from "@/modules/users/types/user.types";
import type { PaginatedResponse } from "@/types/pagination";

import { removeUserMembership } from "../api/remove-user-membership";
import { employeeKeys } from "../query-keys";

export function useRemoveMemberFromCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeUserMembership,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all });

      const previousLists = queryClient.getQueriesData<PaginatedResponse<User>>(
        {
          queryKey: userKeys.all,
          predicate: (query) => query.queryKey[1] === "list",
        },
      );

      queryClient.setQueriesData<PaginatedResponse<User>>(
        {
          queryKey: userKeys.all,
          predicate: (query) => query.queryKey[1] === "list",
        },
        (current) => {
          if (!current) {
            return current;
          }

          const items = current.items.filter((user) => user.id !== userId);
          const removedCount = current.items.length - items.length;

          return {
            items,
            meta: {
              ...current.meta,
              total: Math.max(0, current.meta.total - removedCount),
              totalPages: Math.max(
                1,
                Math.ceil(
                  Math.max(0, current.meta.total - removedCount) /
                    current.meta.take,
                ),
              ),
            },
          };
        },
      );

      return { previousLists };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Usuario sacado de la empresa correctamente");
    },
    onError: (error, _userId, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(
        getErrorMessage(error, "No se pudo sacar al usuario de la empresa"),
      );
    },
  });
}
