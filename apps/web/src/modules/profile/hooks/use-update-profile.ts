"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";
import { authKeys } from "@/modules/auth/query-keys";
import { useAuthStore } from "@/modules/auth/store/auth-store";

import { updateProfile as updateProfileApi } from "../api/update-profile";
import { profileKeys } from "../query-keys";
import type { UpdateProfileData } from "../types/profile.types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      return updateProfileApi(data);
    },
    onSuccess: (_, data) => {
      if (user) {
        setUser({
          ...user,
          firstName: data.firstName ?? user.firstName,
          lastName: data.lastName ?? user.lastName,
        });
      }

      void queryClient.invalidateQueries({ queryKey: authKeys.all });
      void queryClient.invalidateQueries({ queryKey: profileKeys.all });
      toast.success("Perfil actualizado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo actualizar el perfil"));
    },
  });
}
