"use client";

import { LoginForm } from "../components/login-form";
import { useAuth } from "../hooks/use-auth";
import type { LoginSchema } from "../schemas/login.schema";

const LOGIN_DEFAULT_VALUES: LoginSchema = {
  email: "",
  password: "",
};

export function LoginFormContainer() {
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = async (values: LoginSchema) => {
    await login({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <LoginForm
      defaultValues={LOGIN_DEFAULT_VALUES}
      isSubmitting={isLoggingIn}
      onSubmit={handleSubmit}
    />
  );
}
