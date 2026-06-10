"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { getSession } from "../api/get-session";
import { login as loginApi } from "../api/login";
import { logout as logoutApi } from "../api/logout";
import { AUTH_ROUTES } from "../constants";
import { authKeys } from "../query-keys";
import { useAuthStore } from "../store/auth-store";
import type { LoginCredentials } from "../types/auth.types";

export function useAuth() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { accessToken: token } = await loginApi(credentials);
      setAccessToken(token);

      const session = await getSession();
      setUser(session.user);

      return token;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success("Sesión iniciada");
      router.replace(AUTH_ROUTES.dashboard);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo iniciar sesión"));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success("Sesión cerrada");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo cerrar sesión"));
    },
  });

  return {
    accessToken,
    user,
    isAuthenticated: Boolean(accessToken),
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
