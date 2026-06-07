"use client";

import { LoginForm } from "../components/login-form";
import type { LoginSchema } from "../schemas/login.schema";

const LOGIN_DEFAULT_VALUES: LoginSchema = {
  email: "",
  password: "",
};

export function LoginFormContainer() {
  const handleSubmit = async (_values: LoginSchema) => {
    // TODO: conectar useLogin() cuando la autenticación esté lista
  };

  return (
    <LoginForm
      defaultValues={LOGIN_DEFAULT_VALUES}
      isSubmitting={false}
      onSubmit={handleSubmit}
    />
  );
}
