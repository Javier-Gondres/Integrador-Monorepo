"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ChangePasswordForm } from "../components/change-password-form";
import { useChangePassword } from "../hooks/use-change-password";
import {
  type ChangePasswordSchema,
  changePasswordSchema,
} from "../schemas/profile.schema";

export function ChangePasswordTabContainer() {
  const { control, handleSubmit, reset } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useChangePassword();

  const onSubmit = async (data: ChangePasswordSchema) => {
    await changePasswordMutation.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    reset();
  };

  return (
    <ChangePasswordForm
      control={control}
      isSubmitting={changePasswordMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
}
