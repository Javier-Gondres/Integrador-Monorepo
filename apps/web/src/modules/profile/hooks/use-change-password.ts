"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { changePassword as changePasswordApi } from "../api/change-password";
import type { ChangePasswordData } from "../types/profile.types";

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      return changePasswordApi(data);
    },
    onSuccess: () => {
      toast.success("Contraseña actualizada correctamente");
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "No se pudo actualizar la contraseña"),
      );
    },
  });
}
