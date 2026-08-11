"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button, Input } from "@/shared/ui";

import { type LoginSchema, loginSchema } from "../schemas/login.schema";

interface LoginFormProps {
  defaultValues: LoginSchema;
  isSubmitting: boolean;
  onSubmit: (values: LoginSchema) => void | Promise<void>;
}

export function LoginForm({
  defaultValues,
  isSubmitting,
  onSubmit,
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const isDisabled = isSubmitting || Object.keys(errors).length > 0;
  return (
    <div className="w-full text-black space-y-2 p-6">
      <h1 className="text-3xl font-semibold text-center">Iniciar Sesión</h1>
      <p className="text-sm text-center">
        Bienvenido. Ingrese sus credenciales para continuar.
      </p>

      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        className="mt-10 space-y-2"
      >
        <Input
          label="Email"
          type="email"
          placeholder="prueba@ejemplo.com"
          required
          error={errors.email?.message}
          {...register("email", {
            onChange: () => clearErrors("email"),
          })}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="su contraseña"
          required
          error={errors.password?.message}
          {...register("password", {
            onChange: () => clearErrors("password"),
          })}
        />

        <Button
          type="submit"
          disabled={isDisabled}
          style={{ width: "100%", marginTop: "24px" }}
        >
          {isSubmitting ? "Iniciando sesión..." : "Acceder"}
        </Button>
      </form>
    </div>
  );
}
