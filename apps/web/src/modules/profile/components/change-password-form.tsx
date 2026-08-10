"use client";

import { Lock } from "lucide-react";
import { type Control, Controller } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import type { ChangePasswordSchema } from "../schemas/profile.schema";

interface ChangePasswordFormProps {
  control: Control<ChangePasswordSchema>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function ChangePasswordForm({
  control,
  isSubmitting,
  onSubmit,
}: ChangePasswordFormProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div
        style={{
          padding: "16px 20px",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderRadius: "8px",
          borderLeft: `4px solid ${C.primary}`,
        }}
      >
        <p style={{ fontSize: "13px", color: C.bodyText, margin: 0 }}>
          Asegúrate de usar una contraseña fuerte con al menos 8 caracteres.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "500px",
        }}
      >
        <Controller
          name="currentPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="password"
              label="Contraseña Actual"
              placeholder="Ingresa tu contraseña actual"
              error={fieldState.error?.message}
              required
            />
          )}
        />

        <Controller
          name="newPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="password"
              label="Nueva Contraseña"
              placeholder="Ingresa una nueva contraseña"
              error={fieldState.error?.message}
              required
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="password"
              label="Confirmar Nueva Contraseña"
              placeholder="Confirma tu nueva contraseña"
              error={fieldState.error?.message}
              required
            />
          )}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: "10px",
            paddingTop: "6px",
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Lock size={16} />
            {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
          </Button>
        </div>
      </form>
    </div>
  );
}
