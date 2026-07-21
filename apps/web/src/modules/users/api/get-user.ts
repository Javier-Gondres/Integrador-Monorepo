import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { UserDetailDto } from "../types/user.types";

export function getUser(id: string) {
  return apiFetch<UserDetailDto>(ENDPOINTS.users.byId(id));
}
