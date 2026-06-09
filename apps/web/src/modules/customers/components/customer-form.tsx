"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input, Textarea } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  type CustomerFormSchema,
  customerFormSchema,
} from "../schemas/customer.schema";

interface CustomerFormProps {
  isEditing: boolean;
  defaultValues: CustomerFormSchema;
  isSubmitting: boolean;
  onSubmit: (values: CustomerFormSchema) => void | Promise<void>;
  onClose: () => void;
}

export function CustomerForm({
  isEditing,
  defaultValues,
  isSubmitting,
  onSubmit,
  onClose,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormSchema>({
    resolver: zodResolver(customerFormSchema),
    defaultValues,
  });

  return (
    <Modal
      title={isEditing ? "Editar Cliente" : "Nuevo Cliente"}
      description={
        isEditing
          ? "Modifica los datos del cliente."
          : "Completa los campos para añadir un nuevo cliente."
      }
      onClose={onClose}
    >
      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          overflowY: "auto",
        }}
      >
        <Input
          label="Nombre"
          required
          placeholder="Ej. Juan"
          error={errors.firstName?.message}
          {...register("firstName")}
        />

        <Input
          label="Apellido"
          required
          placeholder="Ej. Pérez"
          error={errors.lastName?.message}
          {...register("lastName")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="Ej. correo@dominio.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Teléfono"
          placeholder="Ej. 809-555-1234"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Textarea
          label="Dirección"
          placeholder="Ej. Calle 123, Santo Domingo"
          error={errors.address?.message}
          {...register("address")}
        />

        <Input
          label="Cédula"
          placeholder="Ej. 001-1234567-8"
          error={errors.cedula?.message}
          {...register("cedula")}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            backgroundColor: C.tableHead,
            borderRadius: "8px",
            border: `1px solid ${C.divider}`,
          }}
        >
          <input
            type="checkbox"
            id="customer-isActive"
            {...register("isActive")}
            style={{
              width: "16px",
              height: "16px",
              accentColor: C.primary,
              cursor: "pointer",
            }}
          />
          <label
            htmlFor="customer-isActive"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: C.bodyText,
              cursor: "pointer",
            }}
          >
            Habilitar cliente
          </label>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            paddingTop: "6px",
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
