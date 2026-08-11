"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input, Textarea } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  type SupplierFormSchema,
  supplierFormSchema,
} from "../schemas/supplier.schema";
import {
  formatPhoneMaskRD,
  formatRncMaskRD,
  normalizePhoneValueRD,
  normalizeRncValueRD,
} from "../utils/supplier-formatters";

interface SupplierFormProps {
  isEditing: boolean;
  defaultValues: SupplierFormSchema;
  isSubmitting: boolean;
  onSubmit: (values: SupplierFormSchema) => void | Promise<void>;
  onClose: () => void;
}

const allowDigits = (event: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = [
    "Backspace",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Delete",
    "Tab",
    "Home",
    "End",
  ];

  if (allowedKeys.includes(event.key)) {
    return;
  }

  if (/^[0-9]$/.test(event.key)) {
    return;
  }

  event.preventDefault();
};

export function SupplierForm({
  isEditing,
  defaultValues,
  isSubmitting,
  onSubmit,
  onClose,
}: SupplierFormProps) {
  const {
    register,
    control,
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
          maxLength={100}
          placeholder="Ej. Distribuidora Norte"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Persona de contacto"
          maxLength={100}
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
            maxLength={100}
            placeholder="correo@proveedor.com"
            error={errors.email?.message}
            {...register("email")}
          />

          {/* Teléfono con máscara RD: (809) 555-1234 */}
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                label="Teléfono"
                placeholder="(809) 555-1234"
                inputMode="numeric"
                error={errors.phone?.message}
                value={formatPhoneMaskRD(field.value)}
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(normalizePhoneValueRD(event.target.value))
                }
                onKeyDown={allowDigits}
                onPaste={(event) => {
                  const pasted = event.clipboardData.getData("text/plain");
                  if (!/^[0-9]+$/.test(pasted)) {
                    event.preventDefault();
                  }
                }}
              />
            )}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          {/* RNC con máscara RD: X-XX-XXXXX-X (jurídico, 9 dígitos) ó XXX-XXXXXXX-X (físico, 11 dígitos) */}
          <Controller
            name="rnc"
            control={control}
            render={({ field }) => (
              <Input
                label="RNC"
                placeholder="1-23-45678-9"
                inputMode="numeric"
                error={errors.rnc?.message}
                value={formatRncMaskRD(field.value)}
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(normalizeRncValueRD(event.target.value))
                }
                onKeyDown={allowDigits}
                onPaste={(event) => {
                  const pasted = event.clipboardData.getData("text/plain");
                  if (!/^[0-9]+$/.test(pasted)) {
                    event.preventDefault();
                  }
                }}
              />
            )}
          />
          <Input
            label="Dirección"
            maxLength={250}
            placeholder="Calle, ciudad"
            error={errors.address?.message}
            {...register("address")}
          />
        </div>

        <Textarea
          label="Notas"
          maxLength={500}
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
