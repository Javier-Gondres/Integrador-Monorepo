"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import {
  getSession,
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
} from "../api/get-session";
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
      router.replace(AUTH_ROUTES.login);
      toast.success("Sesión cerrada");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo cerrar sesión"));
    },
  });

  const refreshTokenMutation = useMutation({
    mutationFn: async () => {
      const { accessToken: token } = await refreshTokenApi();
      setAccessToken(token);

      try {
        const session = await getSession();
        setUser(session.user);
        return session;
      } catch (error) {
        clearAuth();
        throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      clearAuth();
      toast.error(getErrorMessage(error, "Sesión expirada"));
    },
  });

  return {
    accessToken,
    user,
    isAuthenticated: Boolean(accessToken),
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refreshToken: refreshTokenMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRefreshing: refreshTokenMutation.isPending,
  };
}

export function useCurrentUser() {
  const user = useAuthStore((state) => state.user);
  return { user };
}

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  return user?.role?.permissions ?? [];
}

export function useHasPermission(code: string) {
  const permissions = usePermissions();
  return permissions.some((permission) => permission.code === code);
}
