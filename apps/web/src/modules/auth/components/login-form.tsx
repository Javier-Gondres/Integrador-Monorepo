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
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

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
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="su contraseña"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex justify-between max-sm:gap-3 pt-2">
          <div className="flex gap-2 items-center">
            <input type="checkbox" id="remember_ps" />
            <label htmlFor="remember_ps" className="text-sm">
              Recordarme
            </label>
          </div>

          <a href="#" className="text-sm hover:underline text-end">
            Contraseña olvidada?
          </a>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          style={{ width: "100%", marginTop: "24px" }}
        >
          Acceder
        </Button>
      </form>
    </div>
  );
}
