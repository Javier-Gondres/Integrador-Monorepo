"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type Resolver, useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input, Textarea } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import { checkCustomerUniqueness } from "../api/check-customer-uniqueness";
import {
  type CustomerFormSchema,
  customerFormSchema,
} from "../schemas/customer.schema";
import {
  formatCedulaMask,
  formatPhoneMask,
  normalizeCedulaValue,
  normalizePhoneValue,
} from "../utils/customer-formatters";

interface CustomerFormProps {
  customerId?: string;
  isEditing: boolean;
  defaultValues: CustomerFormSchema;
  isSubmitting: boolean;
  onSubmit: (values: CustomerFormSchema) => void | Promise<void>;
  onClose: () => void;
}

const allowLettersAndSpaces = (
  event: React.KeyboardEvent<HTMLInputElement>,
) => {
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

  if (/^[A-Za-zÀ-ÖØ-öø-ÿ\s]$/.test(event.key)) {
    return;
  }

  event.preventDefault();
};

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

export function CustomerForm({
  customerId,
  isEditing,
  defaultValues,
  isSubmitting,
  onSubmit,
  onClose,
}: CustomerFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormSchema>({
    resolver: zodResolver(customerFormSchema) as Resolver<CustomerFormSchema>,
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const validateEmailUniqueness = async (value?: string) => {
    const email = value?.trim();
    if (!email) {
      return true;
    }

    try {
      const result = await checkCustomerUniqueness({
        email,
        excludeId: customerId,
      });

      return !result.emailTaken || "Ese correo ya está asociado a otro cliente";
    } catch {
      return "No se pudo verificar la disponibilidad del correo";
    }
  };

  const validateCedulaUniqueness = async (value?: string) => {
    const cedula = value?.replace(/\D/g, "");
    if (!cedula) {
      return true;
    }

    try {
      const result = await checkCustomerUniqueness({
        cedula,
        excludeId: customerId,
      });

      return (
        !result.cedulaTaken || "Esa cédula ya está asociada a otro cliente"
      );
    } catch {
      return "No se pudo verificar la disponibilidad de la cédula";
    }
  };

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
        onSubmit={handleSubmit(onSubmit)}
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
          inputMode="text"
          {...register("firstName")}
          onKeyDown={allowLettersAndSpaces}
          onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => {
            const pasted = event.clipboardData.getData("text/plain");
            if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(pasted)) {
              event.preventDefault();
            }
          }}
        />

        <Input
          label="Apellido"
          required
          placeholder="Ej. Pérez"
          error={errors.lastName?.message}
          inputMode="text"
          {...register("lastName")}
          onKeyDown={allowLettersAndSpaces}
          onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => {
            const pasted = event.clipboardData.getData("text/plain");
            if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(pasted)) {
              event.preventDefault();
            }
          }}
        />

        <Controller
          name="cedula"
          control={control}
          rules={{ validate: validateCedulaUniqueness }}
          render={({ field }) => (
            <Input
              label="Cédula"
              placeholder="Ej. 001-1234567-8"
              inputMode="numeric"
              error={errors.cedula?.message}
              value={formatCedulaMask(field.value)}
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(normalizeCedulaValue(event.target.value))
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
          label="Email"
          type="email"
          placeholder="Ej. correo@dominio.com"
          error={errors.email?.message}
          {...register("email", {
            validate: validateEmailUniqueness,
          })}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              label="Teléfono"
              placeholder="(809) 123-4567"
              inputMode="numeric"
              error={errors.phone?.message}
              value={formatPhoneMask(field.value)}
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(normalizePhoneValue(event.target.value))
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

        <Textarea
          label="Dirección"
          placeholder="Ej. Calle 123, Santo Domingo"
          error={errors.address?.message}
          {...register("address")}
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
