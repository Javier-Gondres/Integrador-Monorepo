"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input, Textarea } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  type SupplierFormSchema,
  supplierFormSchema,
} from "../schemas/supplier.schema";

interface SupplierFormProps {
  isEditing: boolean;
  defaultValues: SupplierFormSchema;
  isSubmitting: boolean;
  onSubmit: (values: SupplierFormSchema) => void | Promise<void>;
  onClose: () => void;
}

export function SupplierForm({
  isEditing,
  defaultValues,
  isSubmitting,
  onSubmit,
  onClose,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormSchema>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues,
  });

  return (
    <Modal
      title={isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
      description={
        isEditing
          ? "Modifica los datos del proveedor."
          : "Registra un proveedor para esta empresa."
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
          placeholder="Ej. Distribuidora Norte"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Persona de contacto"
          placeholder="Nombre del contacto"
          error={errors.contactName?.message}
          {...register("contactName")}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          <Input
            label="Email"
            type="email"
            placeholder="correo@proveedor.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Teléfono"
            placeholder="8095551234"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          <Input
            label="RNC"
            placeholder="123456789"
            error={errors.rnc?.message}
            {...register("rnc")}
          />
          <Input
            label="Dirección"
            placeholder="Calle, ciudad"
            error={errors.address?.message}
            {...register("address")}
          />
        </div>

        <Textarea
          label="Notas"
          placeholder="Información adicional"
          error={errors.notes?.message}
          {...register("notes")}
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
            id="supplier-isActive"
            {...register("isActive")}
            style={{
              width: "16px",
              height: "16px",
              accentColor: C.primary,
              cursor: "pointer",
            }}
          />
          <label
            htmlFor="supplier-isActive"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: C.bodyText,
              cursor: "pointer",
            }}
          >
            Proveedor activo
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
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
