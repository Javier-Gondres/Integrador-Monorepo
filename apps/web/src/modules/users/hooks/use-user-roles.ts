import { useQuery } from "@tanstack/react-query";

import { getUserRoles } from "../api/get-user-roles";
import { userKeys } from "../query-keys";

export function useUserRoles() {
  return useQuery({
    queryKey: userKeys.roles,
    queryFn: getUserRoles,
    staleTime: 60_000,
  });
}
