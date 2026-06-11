"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  type InventoryFormSchema,
  inventoryFormSchema,
} from "../schemas/inventory.schema";
import type { InventoryProductOption } from "../types/inventory.types";
import { formatCurrency } from "../utils/format-currency";

interface InventoryFormProps {
  isEditing: boolean;
  defaultValues: InventoryFormSchema;
  defaultProduct: InventoryProductOption | null;
  isSubmitting: boolean;
  onSubmit: (values: InventoryFormSchema) => void | Promise<void>;
  onClose: () => void;
  renderProductCombobox: (props: {
    selected: InventoryProductOption | null;
    onChange: (product: InventoryProductOption | null) => void;
  }) => ReactNode;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}>
      {children}
    </label>
  );
}

function ReadonlyBox({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "42px",
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        border: `1px solid ${C.inputBorder}`,
        borderRadius: "8px",
        backgroundColor: C.tableHead,
        fontSize: "14px",
        color: C.bodyText,
      }}
    >
      {children}
    </div>
  );
}

function ReadonlyField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <FieldLabel>{label}</FieldLabel>
      <ReadonlyBox>{children}</ReadonlyBox>
    </div>
  );
}

export function InventoryForm({
  isEditing,
  defaultValues,
  defaultProduct,
  isSubmitting,
  onSubmit,
  onClose,
  renderProductCombobox,
}: InventoryFormProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProductOption | null>(defaultProduct);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryFormSchema>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues,
  });

  return (
    <Modal
      title={isEditing ? "Editar inventario" : "Asignar producto"}
      description={
        isEditing
          ? "Actualiza la cantidad en stock de este producto."
          : "Agrega un producto al inventario de la sucursal seleccionada."
      }
      onClose={onClose}
      maxWidth="520px"
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
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <FieldLabel>
            Producto <span style={{ color: C.danger }}>*</span>
          </FieldLabel>
          {isEditing ? (
            <ReadonlyBox>
              <span style={{ fontWeight: 500 }}>
                {selectedProduct?.name ?? "—"}
              </span>
            </ReadonlyBox>
          ) : (
            <Controller
              name="productId"
              control={control}
              render={({ field }) => (
                <>
                  {renderProductCombobox({
                    selected: selectedProduct,
                    onChange: (product) => {
                      field.onChange(product?.id ?? "");
                      setSelectedProduct(product);
                    },
                  })}
                </>
              )}
            />
          )}
          {errors.productId && (
            <span style={{ fontSize: "12px", color: C.danger }}>
              {errors.productId.message}
            </span>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <ReadonlyField label="Código">
            <span
              style={{
                color: selectedProduct ? C.bodyText : C.mutedText,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {selectedProduct?.code ?? "—"}
            </span>
          </ReadonlyField>

          <Input
            label="Cantidad"
            required
            type="number"
            min="0"
            step="any"
            placeholder="0"
            error={errors.quantity?.message}
            {...register("quantity", { valueAsNumber: true })}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <ReadonlyField label="Precio">
            <span
              style={{
                fontWeight: 600,
                color: selectedProduct ? C.bodyText : C.mutedText,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {selectedProduct ? formatCurrency(selectedProduct.price) : "—"}
            </span>
          </ReadonlyField>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <FieldLabel>Estado</FieldLabel>
            <div style={{ display: "flex", alignItems: "center", minHeight: "42px" }}>
              {selectedProduct ? (
                selectedProduct.isActive ? (
                  <Badge variant="success">Activo</Badge>
                ) : (
                  <Badge variant="muted">Inactivo</Badge>
                )
              ) : (
                <span style={{ color: C.mutedText }}>—</span>
              )}
            </div>
          </div>
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
            {isEditing ? "Guardar cambios" : "Asignar producto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
