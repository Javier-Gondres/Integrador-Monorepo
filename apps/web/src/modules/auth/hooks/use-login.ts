import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { clearAccessToken, setAccessToken } from "@/lib/api/access-token";
import { getErrorMessage } from "@/lib/api/errors";

import { login, logout } from "../api/get-session";
import { authKeys } from "../query-keys";
import type { LoginCredentials } from "../types/auth.types";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      void queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success("Sesión iniciada");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo iniciar sesión"));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAccessToken();
      queryClient.clear();
      toast.success("Sesión cerrada");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo cerrar sesión"));
    },
  });
}
