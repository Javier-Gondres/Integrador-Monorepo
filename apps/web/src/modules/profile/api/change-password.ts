import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { ChangePasswordData } from "../types/profile.types";

export async function changePassword(data: ChangePasswordData) {
  return apiFetch(ENDPOINTS.me.password, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
