"use client";

import { User } from "lucide-react";
import { type Control, Controller } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import type { UpdateProfileSchema } from "../schemas/profile.schema";

interface PersonalInfoFormProps {
  email: string;
  control: Control<UpdateProfileSchema>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function PersonalInfoForm({
  email,
  control,
  isSubmitting,
  onSubmit,
}: PersonalInfoFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <Controller
          name="firstName"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Nombre"
              error={fieldState.error?.message}
              required
            />
          )}
        />
        <Controller
          name="lastName"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Apellido"
              error={fieldState.error?.message}
              required
            />
          )}
        />
      </div>

      <div>
        <Input
          type="email"
          label="Correo Electrónico"
          value={email}
          disabled
          style={{
            opacity: 0.6,
            cursor: "not-allowed",
          }}
        />
        <p style={{ fontSize: "12px", color: C.bodyText, marginTop: "6px" }}>
          El correo no se puede modificar
        </p>
      </div>

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
          <User size={16} />
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
