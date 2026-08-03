import { useAuthStore } from "@/modules/auth/store/auth-store";

/** Storage for the access token backed by the auth store. */
export const tokenStorage = {
  get: () => useAuthStore.getState().accessToken,

  set: (token: string) => {
    useAuthStore.getState().setAccessToken(token);
  },

  clear: () => {
    useAuthStore.getState().clearAuth();
  },
};
