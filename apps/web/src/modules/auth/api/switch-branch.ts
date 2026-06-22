import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import { useAuthStore } from "../store/auth-store";
import type { SwitchBranchResponse } from "../types/auth.types";
import { getSession } from "./get-session";

/**
 * Cambia la sucursal activa del usuario, renueva el access token
 * y sincroniza el store con la sesión actualizada.
 */
export async function switchBranch(
  branchId: string,
): Promise<SwitchBranchResponse> {
  const { setAccessToken, setUser } = useAuthStore.getState();

  const result = await apiFetch<SwitchBranchResponse>(
    ENDPOINTS.me.switchBranch,
    {
      method: "POST",
      body: JSON.stringify({ branchId }),
    },
  );

  setAccessToken(result.accessToken);

  const session = await getSession();
  setUser(session.user);

  return result;
}
