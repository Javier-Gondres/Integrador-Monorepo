import {
  getSession,
  refreshToken as refreshTokenApi,
} from "../api/get-session";
import { useAuthStore } from "../store/auth-store";
import type { AuthSession } from "../types/auth.types";

export async function restoreSession(): Promise<AuthSession> {
  const { setAccessToken, setUser } = useAuthStore.getState();

  const { accessToken } = await refreshTokenApi();
  setAccessToken(accessToken);

  const session = await getSession();
  setUser(session.user);

  return session;
}
