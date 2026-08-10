import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { UpdateProfileData } from "../types/profile.types";

export async function updateProfile(data: UpdateProfileData) {
  return apiFetch(ENDPOINTS.me.profile, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
