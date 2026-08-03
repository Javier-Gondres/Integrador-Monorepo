"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  type PlatformCompanyFormSchema,
  platformCompanyFormSchema,
} from "../schemas/platform-company.schema";

interface PlatformCompanyFormProps {
  defaultValues: PlatformCompanyFormSchema;
  isSubmitting: boolean;
  onSubmit: (values: PlatformCompanyFormSchema) => void | Promise<void>;
  onClose: () => void;
}

export function PlatformCompanyForm({
  defaultValues,
  isSubmitting,
  onSubmit,
  onClose,
}: PlatformCompanyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlatformCompanyFormSchema>({
    resolver: zodResolver(platformCompanyFormSchema),
    defaultValues,
  });

  return (
    <Modal
      onClose={onClose}
      title="Nueva empresa tenant"
      description="Crea la empresa, su sucursal principal y el usuario OWNER inicial."
    >
      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
        className="p-4 sm:p-6"
      >
        <Input
          label="Nombre de la empresa"
          required
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="RNC"
          placeholder="Opcional"
          error={errors.rnc?.message}
          {...register("rnc")}
        />

        <p
          style={{
            margin: "4px 0 0",
            fontSize: "13px",
            fontWeight: 600,
            color: C.bodyText,
          }}
        >
          Owner inicial
        </p>

        <Input
          label="Nombre"
          required
          error={errors.ownerFirstName?.message}
          {...register("ownerFirstName")}
        />
        <Input
          label="Apellido"
          required
          error={errors.ownerLastName?.message}
          {...register("ownerLastName")}
        />
        <Input
          label="Email de acceso"
          type="email"
          required
          error={errors.ownerEmail?.message}
          {...register("ownerEmail")}
        />
        <Input
          label="Contraseña temporal"
          type="password"
          required
          error={errors.ownerPassword?.message}
          {...register("ownerPassword")}
        />

        <div
          style={{
            display: "flex",
            gap: "10px",
            paddingTop: "8px",
            borderTop: `1px solid ${C.divider}`,
          }}
          className="flex-col sm:flex-row sm:justify-end"
        >
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full justify-center sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full justify-center sm:w-auto"
          >
            {isSubmitting ? "Creando..." : "Crear empresa"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
