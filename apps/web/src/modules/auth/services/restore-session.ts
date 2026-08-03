import { refreshAccessToken } from "@/lib/api/refresh-access-token";

import { getSession } from "../api/get-session";
import { useAuthStore } from "../store/auth-store";
import type { AuthSession } from "../types/auth.types";

export async function restoreSession(): Promise<AuthSession> {
  const { setUser } = useAuthStore.getState();

  await refreshAccessToken();

  const session = await getSession();
  setUser(session.user);

  return session;
}
