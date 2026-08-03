import { useQuery } from "@tanstack/react-query";

import { getUsers } from "../api/get-users";
import { mapUsersPageToUi } from "../mappers/user.mapper";
import { userKeys } from "../query-keys";
import type { UserFilters } from "../types/user.types";

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => mapUsersPageToUi(await getUsers(filters)),
  });
}
