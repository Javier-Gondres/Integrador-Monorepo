import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { UserFilters, UsersApiPage } from "../types/user.types";

export async function getUsers(filters?: UserFilters) {
  return apiFetch<UsersApiPage>(ENDPOINTS.users.root, {
    params: {
      page: filters?.page,
      limit: filters?.take,
      search: filters?.search,
      role: filters?.role,
      isActive: filters?.isActive,
    },
  });
}
