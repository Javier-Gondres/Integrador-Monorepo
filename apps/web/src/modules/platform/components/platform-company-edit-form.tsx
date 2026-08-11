"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  type UpdatePlatformCompanyFormSchema,
  updatePlatformCompanyFormSchema,
} from "../schemas/platform-company.schema";

interface PlatformCompanyEditFormProps {
  defaultValues: UpdatePlatformCompanyFormSchema;
  isSubmitting: boolean;
  onSubmit: (values: UpdatePlatformCompanyFormSchema) => void | Promise<void>;
  onClose: () => void;
}

export function PlatformCompanyEditForm({
  defaultValues,
  isSubmitting,
  onSubmit,
  onClose,
}: PlatformCompanyEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePlatformCompanyFormSchema>({
    resolver: zodResolver(updatePlatformCompanyFormSchema),
    defaultValues,
  });

  return (
    <Modal
      onClose={onClose}
      title="Editar empresa"
      description="Actualiza el nombre y el RNC de la empresa tenant."
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
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
